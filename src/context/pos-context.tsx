
"use client";

import * as React from 'react';
import type { POSContextType, POSState, POSCartItem, InventoryItem, Customer, POSPaymentMethod } from '@/types';

const POSContext = React.createContext<POSContextType | undefined>(undefined);

const initialState: POSState = {
  cart: [],
  selectedCustomer: null,
  paymentMethod: null,
  subtotal: 0,
  taxAmount: 0, // Store actual tax amount
  discountAmount: 0,
  totalAmount: 0,
  notes: "",
};

// This would ideally come from settings, but for now, a fixed rate.
const DEFAULT_TAX_RATE_PERCENTAGE = 7.5; 

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<POSState>(initialState);
  const [currentTaxRate, setCurrentTaxRate] = React.useState(DEFAULT_TAX_RATE_PERCENTAGE);

  const calculateTotals = React.useCallback((cartItems: POSCartItem[], discount: number, taxRate: number) => {
    const sub = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = (sub - discount) * (taxRate / 100); // Tax applied after discount
    const total = sub - discount + tax;
    return { subtotal: sub, taxAmount: tax, totalAmount: total };
  }, []);

  React.useEffect(() => {
    const { subtotal, taxAmount, totalAmount } = calculateTotals(state.cart, state.discountAmount, currentTaxRate);
    setState(prevState => ({
      ...prevState,
      subtotal,
      taxAmount,
      totalAmount,
    }));
  }, [state.cart, state.discountAmount, currentTaxRate, calculateTotals]);

  const addItemToCart = (item: InventoryItem, quantity: number) => {
    setState(prevState => {
      const existingItemIndex = prevState.cart.findIndex(cartItem => cartItem.itemId === item.id);
      let newCart: POSCartItem[];

      if (existingItemIndex > -1) {
        newCart = prevState.cart.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + quantity, totalPrice: (cartItem.quantity + quantity) * cartItem.unitPrice }
            : cartItem
        );
      } else {
        const newCartItem: POSCartItem = {
          itemId: item.id,
          itemName: item.name,
          quantity,
          unitPrice: item.price,
          totalPrice: item.price * quantity,
          imageUrl: item.imageUrl,
          stock: item.stock,
        };
        newCart = [...prevState.cart, newCartItem];
      }
      return { ...prevState, cart: newCart };
    });
  };

  const removeItemFromCart = (itemId: string) => {
    setState(prevState => ({
      ...prevState,
      cart: prevState.cart.filter(item => item.itemId !== itemId),
    }));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setState(prevState => ({
      ...prevState,
      cart: prevState.cart.map(item =>
        item.itemId === itemId
          ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
          : item
      ),
    }));
  };

  const clearCart = () => {
    setState(prevState => ({ ...prevState, cart: [] }));
  };

  const selectCustomer = (customer: Customer | null) => {
    setState(prevState => ({ ...prevState, selectedCustomer: customer }));
  };

  const setPaymentMethod = (method: POSPaymentMethod | null) => {
    setState(prevState => ({ ...prevState, paymentMethod: method }));
  };
  
  const applyDiscount = (amount: number) => {
    // Assuming amount is a fixed value. Could be extended for percentage.
    setState(prevState => ({ ...prevState, discountAmount: Math.max(0, amount) }));
  };

  const setPOSTax = (taxRatePercentage: number) => {
    setCurrentTaxRate(Math.max(0, taxRatePercentage));
  };
  
  const setPOSNotes = (notes: string) => {
    setState(prevState => ({ ...prevState, notes }));
  };

  const resetPOSSession = () => {
    setState(initialState);
    setCurrentTaxRate(DEFAULT_TAX_RATE_PERCENTAGE);
  };

  return (
    <POSContext.Provider
      value={{
        ...state,
        addItemToCart,
        removeItemFromCart,
        updateItemQuantity,
        clearCart,
        selectCustomer,
        setPaymentMethod,
        applyDiscount,
        setPOSTax,
        setPOSNotes,
        resetPOSSession,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = React.useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
}
