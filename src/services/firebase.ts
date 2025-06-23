import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  orderBy 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, PortfolioItem } from '../types';

interface WatchlistItem {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  addedAt: Date;
}

export class FirebaseService {
  private static instance: FirebaseService;

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  // Authentication - Using popup for better reliability
  async signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      console.log('🔐 Starting Google sign in with popup...');
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        console.log('✅ Google sign in successful:', result.user.email);
        const userData = await this.createOrGetUser(result.user);
        console.log('✅ User data created/retrieved:', userData);
        return userData;
      } else {
        throw new Error('No user returned from Google sign in');
      }
    } catch (error) {
      console.error('❌ Google sign in error:', error);
      throw error;
    }
  }

  private async createOrGetUser(firebaseUser: FirebaseUser): Promise<User> {
    try {
      console.log('🔍 Checking for existing user:', firebaseUser.uid);
      
      // First check if user exists
      const existingUser = await this.getUserData(firebaseUser.uid);
      
      if (existingUser) {
        console.log('✅ Existing user found:', existingUser.email);
        // Update user info in case it changed
        await this.updateUserInfo(firebaseUser.uid, {
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName!,
          photoURL: firebaseUser.photoURL || undefined
        });
        return existingUser;
      }
      
      // Create new user
      console.log('🆕 Creating new user...');
      const newUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName!,
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
        hasCompletedOnboarding: false
      };
      
      await this.saveUser(newUser);
      console.log('✅ New user created:', newUser.email);
      
      return newUser;
    } catch (error) {
      console.error('❌ Error creating/getting user:', error);
      throw error;
    }
  }

  async saveUser(user: User): Promise<void> {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        ...user,
        createdAt: new Date()
      });
      console.log('✅ User saved to Firestore');
    } catch (error) {
      console.error('❌ Error saving user:', error);
      throw error;
    }
  }

  async updateUserInfo(uid: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updates);
      console.log('✅ User info updated');
    } catch (error) {
      console.error('❌ Error updating user info:', error);
      throw error;
    }
  }

  async getUserData(uid: string): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        const userData = {
          uid,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          country: data.country,
          createdAt: data.createdAt.toDate(),
          hasCompletedOnboarding: data.hasCompletedOnboarding || false
        };
        console.log('✅ User data retrieved from Firestore');
        return userData;
      }
      
      console.log('ℹ️ No user data found in Firestore');
      return null;
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return null;
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser?.email || 'null');
      
      if (firebaseUser) {
        try {
          // Always fetch fresh user data to ensure we have latest info
          const userData = await this.getUserData(firebaseUser.uid);
          if (userData) {
            console.log('✅ Fresh user data loaded, calling callback');
            callback(userData);
          } else {
            console.log('❌ No user data found, calling callback with null');
            callback(null);
          }
        } catch (error) {
          console.error('❌ Error in auth state change:', error);
          callback(null);
        }
      } else {
        console.log('ℹ️ No firebase user, calling callback with null');
        callback(null);
      }
    });
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      console.log('✅ User signed out');
    } catch (error) {
      console.error('❌ Error signing out:', error);
      throw error;
    }
  }

  async updateUserCountry(uid: string, country: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { country });
      console.log('✅ User country updated to:', country);
    } catch (error) {
      console.error('❌ Error updating user country:', error);
      throw error;
    }
  }

  async markOnboardingComplete(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { hasCompletedOnboarding: true });
      console.log('✅ Onboarding marked as complete');
    } catch (error) {
      console.error('❌ Error marking onboarding complete:', error);
      throw error;
    }
  }

  // Portfolio Management
  async addToPortfolio(portfolioItem: Omit<PortfolioItem, 'id'>): Promise<string> {
    const portfolioRef = collection(db, 'portfolio');
    const docRef = await addDoc(portfolioRef, {
      ...portfolioItem,
      buyDate: new Date()
    });
    return docRef.id;
  }

  async getPortfolio(userId: string): Promise<PortfolioItem[]> {
    const portfolioRef = collection(db, 'portfolio');
    const q = query(
      portfolioRef,
      where('userId', '==', userId),
      orderBy('buyDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      buyDate: doc.data().buyDate.toDate()
    } as PortfolioItem));
  }

  async removeFromPortfolio(portfolioItemId: string): Promise<void> {
    const portfolioRef = doc(db, 'portfolio', portfolioItemId);
    await deleteDoc(portfolioRef);
  }

  async updatePortfolioItem(portfolioItemId: string, updates: Partial<PortfolioItem>): Promise<void> {
    const portfolioRef = doc(db, 'portfolio', portfolioItemId);
    await updateDoc(portfolioRef, updates);
  }

  async clearPortfolio(userId: string): Promise<void> {
    const portfolioRef = collection(db, 'portfolio');
    const q = query(portfolioRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }

  // Watchlist Management - Fixed for Firebase indexes
  async addToWatchlist(watchlistItem: Omit<WatchlistItem, 'id'>): Promise<string> {
    const watchlistRef = collection(db, 'watchlist');
    const docRef = await addDoc(watchlistRef, {
      ...watchlistItem,
      addedAt: new Date()
    });
    return docRef.id;
  }

  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    try {
      const watchlistRef = collection(db, 'watchlist');
      
      // Use simple query without orderBy to avoid index requirements
      const q = query(
        watchlistRef,
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        addedAt: doc.data().addedAt.toDate()
      } as WatchlistItem));
      
      // Sort in memory instead of using Firestore orderBy
      return items.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      throw error;
    }
  }

  async removeFromWatchlist(watchlistItemId: string): Promise<void> {
    const watchlistRef = doc(db, 'watchlist', watchlistItemId);
    await deleteDoc(watchlistRef);
  }
}