import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

export interface CartItem {
  id: string;
  cartItemId?: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  addons?: { id: string; name: string; price: number }[];
}

export interface OrderHistoryItem {
  id: string;
  items: CartItem[];
  total: number;
  date: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity' | 'cartItemId'>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  totalItems: number;
  totalPrice: number;
  checkout: (tableNumber: string, type: string) => void;
  isCartOpen: boolean;
  toggleCart: () => void;
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
  orderHistory: OrderHistoryItem[];
  clearOrderHistory: () => void;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  totalItems: 0,
  totalPrice: 0,
  checkout: () => {},
  isCartOpen: false,
  toggleCart: () => {},
  activeOrderId: null,
  setActiveOrderId: () => {},
  orderHistory: [],
  clearOrderHistory: () => {}
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get table number from URL to isolate local storage state per table
  const getTableNum = () => {
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/table\/([^/]+)/);
      return match ? `_${match[1]}` : '_default';
    }
    return '_default';
  };
  const tableSuffix = getTableNum();

  // Load initial cart from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem(`restaurant_cart${tableSuffix}`);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>(() => {
    try {
      const savedHistory = localStorage.getItem(`restaurant_order_history${tableSuffix}`);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Load active order tracking ID from localStorage
  const [activeOrderId, setActiveOrderId] = useState<string | null>(() => {
    return localStorage.getItem(`restaurant_active_order${tableSuffix}`) || null;
  });

  const { socket } = useSocket();

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`restaurant_cart${tableSuffix}`, JSON.stringify(cart));
  }, [cart, tableSuffix]);

  // Save order history to localStorage
  useEffect(() => {
    localStorage.setItem(`restaurant_order_history${tableSuffix}`, JSON.stringify(orderHistory));
  }, [orderHistory, tableSuffix]);

  // Save active order tracking ID to localStorage
  useEffect(() => {
    if (activeOrderId) {
      localStorage.setItem(`restaurant_active_order${tableSuffix}`, activeOrderId);
    } else {
      localStorage.removeItem(`restaurant_active_order${tableSuffix}`);
    }
  }, [activeOrderId, tableSuffix]);

  // Listen for the confirmed order from the backend
  useEffect(() => {
    if (!socket) return;
    
    const handleOrderConfirmed = (order: any) => {
      setActiveOrderId(order.id);
      
      // Add to session history
      setOrderHistory(prev => {
        // Prevent duplicate entries if event fires twice
        if (prev.some(o => o.id === order.id)) return prev;
        
        return [...prev, {
          id: order.id,
          items: order.items,
          total: order.total,
          date: Date.now()
        }];
      });
    };
    
    socket.on('order_confirmed', handleOrderConfirmed);
    
    const handleStatusChange = (data: any) => {
      const incomingId = data.orderId || data.id;
      if (data.status === 'PAID') {
        setOrderHistory((prev) => {
          if (prev.some(o => o.id === incomingId)) {
            setActiveOrderId(null);
            return []; // Clear history since they paid
          }
          return prev;
        });
      }
    };
    socket.on('order_status_changed', handleStatusChange);
    
    return () => {
      socket.off('order_confirmed', handleOrderConfirmed);
      socket.off('order_status_changed', handleStatusChange);
    };
  }, [socket]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const clearOrderHistory = () => {
    setOrderHistory([]);
    setActiveOrderId(null);
  };

  const addToCart = (newItem: Omit<CartItem, 'quantity' | 'cartItemId'>) => {
    setCart((prev) => {
      // Find an existing item with the exact same ID AND notes
      const existing = prev.find(item => item.id === newItem.id && item.notes === newItem.notes);
      
      if (existing) {
        return prev.map(item => 
          (item.id === newItem.id && item.notes === newItem.notes) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      
      const cartItemId = `${newItem.id}-${Date.now()}`;
      return [...prev, { ...newItem, quantity: 1, cartItemId }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => (item.cartItemId || item.id) !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if ((item.cartItemId || item.id) === cartItemId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const checkout = (tableNumber: string, type: string) => {
    if (cart.length === 0 || !socket) return;
    
    const orderData = {
      table: tableNumber,
      type: type,
      items: cart,
      total: totalPrice
    };

    socket.emit('new_order', orderData);
    setCart([]); // Clear cart after checkout
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => {
    const itemTotal = item.price + (item.addons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0);
    return sum + (itemTotal * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, 
      totalItems, totalPrice, checkout, 
      isCartOpen, toggleCart,
      activeOrderId, setActiveOrderId,
      orderHistory, clearOrderHistory
    }}>
      {children}
    </CartContext.Provider>
  );
};
