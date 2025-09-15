"use client";

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Image from 'next/image';
import { app, db } from '@/lib/firebase';
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
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const publicPaths = ['/', '/login', '/about', '/contact', '/blog', '/privacy', '/terms', '/checkout'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>(initialState);
  const router = useRouter();
  const pathname = usePathname();
  const auth = getAuth(app);

  const fetchUserRolesAndSelectFirstBusiness = React.useCallback(async (user: UserProfile): Promise<void> => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.warn(`No user document found for UID: ${user.uid}`);
        setState(prev => ({ ...prev, status: 'no_business', user, error: new Error("User profile not found in database.") }));
        return;
      }
      
      const userData = userSnap.data() as UserStaff;
      const businessId = userData.businessId;

      if (!businessId) {
        setState(prev => ({ ...prev, status: 'no_business', user, error: new Error("User is not associated with a business.") }));
        return;
      }

      const businessDocRef = doc(db, "businessInstances", businessId);
      const businessDocSnap = await getDoc(businessDocRef);

      if (!businessDocSnap.exists()) {
        setState(prev => ({ ...prev, status: 'no_business', user, error: new Error(`Business instance ${businessId} not found.`) }));
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
        user,
        status: 'authenticated',
        userBusinessRoles: roles,
        currentBusinessId: businessId,
        currentRole: userData.role,
        currentBusiness: { ...businessData },
        businessSettings: businessData.settings || null,
        error: null,
      }));

    } catch (error) {
      console.error("Error fetching user roles:", error);
      setState(prev => ({ ...prev, status: 'unauthenticated', user, error: new Error("Failed to fetch user data.") }));
    }
  }, []);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (state.status !== 'authenticated') {
          setState(prev => ({ ...prev, status: 'loading' }));
          fetchUserRolesAndSelectFirstBusiness({ uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL });
        }
      } else {
        setState({ ...initialState, status: 'unauthenticated' });
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, fetchUserRolesAndSelectFirstBusiness]);

  const logout = async () => {
    try {
      await signOut(auth);
      setState({ ...initialState, status: 'unauthenticated' });
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const selectBusiness = async (businessId: string) => {
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
          currentBusiness: { ...businessData },
          businessSettings: businessData.settings || null,
        }));
      }
    }
  };
  
  const updateCurrentBusiness = (updates: Partial<BusinessInstance>) => {
    setState(prev => {
      if (!prev.currentBusiness) return prev;
      const updatedBusiness = { ...prev.currentBusiness, ...updates };
      return { ...prev, currentBusiness: updatedBusiness };
    });
  };

  // Centralized redirect and loading logic
  if (state.status === 'loading' && !pathname.startsWith('/login')) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <h1 className="text-7xl font-bold animate-shimmer">Zeneva</h1>
        <p className="text-muted-foreground mt-2">Loading your business...</p>
      </div>
    );
  }

  const isPublicPath = publicPaths.some(p => pathname.startsWith(p) || pathname === '/');

  if (state.status === 'unauthenticated' && !isPublicPath) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <h1 className="text-7xl font-bold animate-shimmer">Zeneva</h1>
        <p className="text-muted-foreground mt-2">Redirecting to login...</p>
      </div>
    );
  }
  
  if (state.status === 'no_business' && !isPublicPath) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-6 text-center">
<Image src="/icon.png" alt="Zeneva Logo" width={32} height={32} />       
 <h2 className="text-2xl font-semibold mb-2">Welcome, {state.user?.displayName || state.user?.email}!</h2>
        <p className="text-muted-foreground mb-4">You are not yet associated with any business in Zeneva.</p>
        <p className="text-sm text-muted-foreground mb-6">
          Please contact your administrator to be added to a business, or create a new one if you are the owner.
        </p>
        <Button onClick={logout}>Logout</Button>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
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