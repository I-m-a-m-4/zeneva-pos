
import type { LucideIcon } from 'lucide-react';
import type { z } from 'zod';
import type { ProductTroubleshootInput, ProductTroubleshootOutput } from '@/ai/flows/product-troubleshoot-flow';

export interface InventoryItem {
  id: string;
  name: string; 
  sku: string; 
  stock: number;
  price: number;
  category: string;
  variantDescription?: string; 
  lastSaleDate?: string; 
  imageUrl?: string;
  lowStockThreshold: number;
  description?: string;
  dataAiHint?: string;
  barcode?: string;
  businessId?: string; 
  createdAt?: any; 
  updatedAt?: any; 
}

export interface SaleItem {
  itemId: string; 
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Receipt {
  id: string;
  receiptNumber: string; 
  date: string; 
  customerName?: string;
  customerId?: string; 
  items: SaleItem[];
  subtotal: number;
  tax: number; 
  discountAmount?: number; 
  total: number;
  paymentMethod: string;
  staffId?: string; 
  businessId?: string; 
  outletId?: string; 
  notes?: string;
  createdAt?: any; 
  updatedAt?: any; 
  customerDetails?: Customer;
}

export interface PaymentRecord {
  id: string; 
  receiptId: string; 
  businessId: string;
  staffId: string; 
  amount: number;
  method: string; 
  targetAccountId: string; 
  transactionRef?: string; 
  status: 'completed' | 'pending' | 'failed';
  createdAt: any; 
  notes?: string;
}


export interface Alert {
  id:string;
  type: 'low_stock' | 'system' | 'promo';
  title: string;
  message: string;
  date: string;
  read: boolean;
  severity: 'critical' | 'warning' | 'info';
}

export type UserRole = 'admin' | 'manager' | 'vendor_operator';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  type: 'item';
  disabled?: boolean;
  external?: boolean;
  label?: string;
  description?: string;
  roles?: UserRole[]; 
}

export interface NavItemGroup {
  title: string;
  icon: LucideIcon;
  type: 'group';
  children: NavItem[];
  roles?: UserRole[]; 
  label?: string;
}

export interface SearchableAppItem {
  id: string;
  title: string;
  description?: string;
  href: string;
  icon: LucideIcon;
  keywords: string[];
  actionType?: 'navigate' | 'modal';
}

export interface StaffMember { 
  id: string; 
  email: string;
  fullName?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  businessId: string; 
  createdAt?: any; 
  updatedAt?: any; 
}

export type UserStaff = StaffMember & { 
  lastLogin?: string; 
};


export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  address?: string;
  notes?: string;
  totalSpent: number;
  lastPurchase?: string; 
  customerSince?: string; 
  status: 'Active' | 'Inactive' | 'New';
  purchaseCount?: number;
  tags?: string[];
  loyaltyPoints?: number;
  businessId?: string; 
  createdAt?: any;
  updatedAt?: any;
}

export interface WaitlistItem {
  id: string;
  productId: string;
  productName: string;
  customerEmail: string;
  requestedAt: string; 
  notified: boolean;
  businessId?: string; 
  createdAt?: any;
}

export interface POSCartItem extends SaleItem {
  imageUrl?: string; 
  stock?: number; 
}

export type POSPaymentMethod = 'Cash' | 'Card (External POS)' | 'Bank Transfer' | 'Cheque' | 'Other';

export interface POSState {
  cart: POSCartItem[];
  selectedCustomer: Customer | null;
  paymentMethod: POSPaymentMethod | null;
  subtotal: number;
  taxAmount: number; 
  discountAmount: number; 
  totalAmount: number;
  notes?: string;
}

export interface POSContextType extends POSState {
  addItemToCart: (item: InventoryItem, quantity: number) => void;
  removeItemFromCart: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  selectCustomer: (customer: Customer | null) => void;
  setPaymentMethod: (method: POSPaymentMethod | null) => void;
  applyDiscount: (amount: number) => void; 
  setPOSTax: (taxRatePercentage: number) => void; 
  setPOSNotes: (notes: string) => void;
  resetPOSSession: () => void;
}

export interface BusinessSettings {
  currency?: string;
  timezone?: string;
  defaultTaxRate?: number;
  paymentBankAccountId?: string; 
  paymentBankName?: string;     
  paymentInstructions?: string; 
  vendorPolicyEnabled?: boolean;
  vendorPolicyText?: string;
  
  loyaltyProgramEnabled?: boolean;
  pointsPerUnit?: number;
  loyaltyPointsForReward?: number;
  loyaltyRewardDiscountPercentage?: number;
  
}

export interface BusinessInstance {
  id: string; 
  ownerId: string; 
  ownerEmail: string; 
  businessName: string;
  subscriptionTierId: string; 
  status: 'Active' | 'Suspended' | 'Trial';
  createdAt: string; 
  trialEndsAt?: string; 
  userCount?: number;
  totalPlatformSpend?: number;
  settings?: BusinessSettings;
  businessDetails?: {
    address?: string;
    phone?: string;
    email?: string;
  };
}


export interface SubscriptionTier {
  id: string; 
  name: string; 
  priceMonthly?: number;
  priceYearly?: number;
  priceLifetime?: number;
  productLimit?: number | 'unlimited';
  userLimit?: number | 'unlimited';
  features: string[];
  cta: string;
  href: string;
  popular?: boolean;
  gradient?: string; 
}


export interface ActivationCode {
  id: string; 
  label: string; 
  tierId: string; 
  duration: '7_days_trial' | '1_month' | '3_months' | '1_year' | 'lifetime';
  status: 'Active' | 'Used' | 'Expired' | 'Revoked';
  generatedAt: string; 
  usedAt?: string; 
  usedByInstanceId?: string; 
  usedByEmail?: string;
  expiresAt?: string; 
}


export interface UserProfile { 
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface UserBusinessRole { 
  businessId: string;
  businessName: string;
  role: UserRole;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'no_business';

export interface AuthState {
  status: AuthStatus;
  user: UserProfile | null; 
  userBusinessRoles: UserBusinessRole[]; 
  currentBusinessId: string | null; 
  currentRole: UserRole | null; 
  error: Error | null;
  businessSettings: BusinessSettings | null; 
  currentBusiness: BusinessInstance | null;
}

export interface AuthContextType extends AuthState {
  logout: () => void; 
  selectBusiness: (businessId: string) => Promise<void>; 
  fetchUserRolesAndSelectFirstBusiness: (user: import('firebase/auth').User) => Promise<void>;
  updateCurrentBusiness: (updates: Partial<BusinessInstance>) => void;
}

export interface CompetitorInsight {
  id: string;
  businessId: string;
  insightType: 'popular_product' | 'pricing_benchmark' | 'review_trend';
  data: any; 
  fetchedAt: any; 
  sourceAPI?: string; 
}

export interface BusinessInsight {
  id: string;
  businessId: string;
  insightType: 'restock_suggestion' | 'pricing_adjustment' | 'marketing_opportunity';
  description: string;
  actionableStep?: string; 
  relatedProductId?: string;
  generatedAt: any; 
}

export interface AuditLogEntry {
  id: string;
  businessId: string;
  userId: string; 
  userEmail?: string; 
  actionType: string; 
  details: Record<string, any>; 
  timestamp: any; 
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string; 
  avatarUrl?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string; 
  category: string;
  imageUrl: string;
  dataAiHint: string;
  isFeatured?: boolean;
  content: string; 
  likes: number;
  comments: Comment[];
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  vendor?: string;
  status: 'Paid' | 'Pending' | 'Reimbursed';
  businessId?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Discount {
    id: string;
    name: string;
    type: 'Percentage' | 'Fixed Amount';
    value: number;
    appliesTo: string;
    status: 'Active' | 'Expired' | 'Scheduled';
    startDate?: string;
    endDate?: string;
    businessId?: string;
    createdAt?: any;
    updatedAt?: any;
}

// AI Flow Types
export { ProductTroubleshootInput, ProductTroubleshootOutput };
export { BusinessInsightInput, BusinessInsightOutput } from '@/ai/flows/business-insights-flow';
