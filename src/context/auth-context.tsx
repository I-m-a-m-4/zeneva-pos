
"use client";

import *as React from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { app, db, isPlaceholderConfig } from '@/lib/firebase';
import type {
  AuthContextType,
  AuthState,
  UserProfile,
  UserBusinessRole,
  UserRole,
  BusinessSettings,
  BusinessInstance,
  AuthStatus,
  UserStaff,
} from '@/types';

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  status: 'loading',
  user: null,
  userBusinessRoles: [],
  currentBusinessId: null,
  currentRole: null,
  currentBusiness: null,
  businessSettings: null,
  error: null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>(initialState);
  const router = useRouter();
  const auth = getAuth(app);

  const fetchUserRolesAndSelectFirstBusiness = React.useCallback(async (userId: string): Promise<void> => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
          console.warn(`No user document found for UID: ${userId}`);
          setState(prev => ({ ...prev, status: 'no_business', userBusinessRoles: [], error: new Error("User profile not found in database.") }));
          return;
      }
      
      const userData = userSnap.data() as UserStaff;

      // In a multi-business scenario, you might query where user is a member.
      // For this 1-to-1 model, we fetch the single business instance they belong to.
      const businessId = userData.businessId;
      if (!businessId) {
          setState(prev => ({ ...prev, status: 'no_business', error: new Error("User is not associated with a business.") }));
          return;
      }

      const businessDocRef = doc(db, "businessInstances", businessId);
      const businessDocSnap = await getDoc(businessDocRef);

      if (!businessDocSnap.exists()) {
          setState(prev => ({ ...prev, status: 'no_business', error: new Error(`Business instance ${businessId} not found.`) }));
          return;
      }
      
      const businessData = businessDocSnap.data() as BusinessInstance;
      
      const roles: UserBusinessRole[] = [{
          businessId: businessId,
          businessName: businessData.businessName,
          role: userData.role
      }];

      setState(prev => ({
        ...prev,
        status: 'authenticated',
        userBusinessRoles: roles,
        currentBusinessId: businessId,
        currentRole: userData.role,
        currentBusiness: { id: businessId, ...businessData },
        businessSettings: businessData.settings || null,
        error: null,
      }));

    } catch (error) {
      console.error("Error fetching user roles:", error);
      setState(prev => ({ ...prev, status: 'unauthenticated', error: new Error("Failed to fetch user data.") }));
    }
  }, []);


  React.useEffect(() => {
    if (isPlaceholderConfig()) {
      console.error("CRITICAL: Firebase is not configured with real credentials. The app will not function correctly. Please update src/lib/firebase.ts");
      setState(prev => ({ ...prev, status: 'unauthenticated', error: new Error("Firebase credentials are not configured.") }));
      router.push('/login');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setState(prev => ({ ...prev, status: 'loading', user: { uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL } }));
        fetchUserRolesAndSelectFirstBusiness(user.uid);
      } else {
        setState(initialState); // Reset state to initial
        router.push('/login');  // Redirect to login if user is not found
      }
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const login = async (userProfile: UserProfile) => {
    // This would be used if you had a custom login form instead of relying on onAuthStateChanged
  };

  const logout = async () => {
    try {
        await signOut(auth);
        setState(initialState);
        router.push('/login');
    } catch (error) {
        console.error("Error signing out: ", error);
    }
  };

  const selectBusiness = async (businessId: string) => {
    // This function can remain for multi-business scenarios in the future.
    setState(prev => ({ ...prev, status: 'loading' }));
    const roleInfo = state.userBusinessRoles.find(r => r.businessId === businessId);
    if (roleInfo && state.user) {
      const businessDocRef = doc(db, "businessInstances", businessId);
      const businessDocSnap = await getDoc(businessDocRef);
      if (businessDocSnap.exists()) {
        const businessData = businessDocSnap.data() as BusinessInstance;
        setState(prev => ({
          ...prev,
          status: 'authenticated',
          currentBusinessId: businessId,
          currentRole: roleInfo.role,
          currentBusiness: { id: businessId, ...businessData },
          businessSettings: businessData.settings || null,
        }));
      }
    } else {
      console.error(`AuthContext: User does not have a role in business ${businessId} or roles not loaded.`);
      setState(prev => ({ ...prev, status: 'no_business', error: new Error("Cannot select business: role not found.") }));
    }
  };
  
  const updateCurrentBusiness = (updates: Partial<BusinessInstance>) => {
    setState(prev => {
        if (!prev.currentBusiness) return prev;
        const updatedBusiness = { ...prev.currentBusiness, ...updates };
        return { ...prev, currentBusiness: updatedBusiness };
    });
  };


  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        selectBusiness,
        fetchUserRolesAndSelectFirstBusiness,
        updateCurrentBusiness,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
