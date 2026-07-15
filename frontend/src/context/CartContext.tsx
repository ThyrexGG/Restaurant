import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

export interface CartItem {
  id: string;
  cartItemId?: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity' | 'cartItemId'>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  totalItems: number;
  totalPrice: number;
  checkout: (tableNumber: string) => void;
  isCartOpen: boolean;
  toggleCart: () => void;
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
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
  setActiveOrderId: () => {}
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial cart from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('restaurant_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Load active order tracking ID from localStorage
  const [activeOrderId, setActiveOrderId] = useState<string | null>(() => {
    return localStorage.getItem('restaurant_active_order') || null;
  });

  const { socket } = useSocket();

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('restaurant_cart', JSON.stringify(cart));
  }, [cart]);

  // Save active order tracking ID to localStorage
  useEffect(() => {
    if (activeOrderId) {
      localStorage.setItem('restaurant_active_order', activeOrderId);
    } else {
      localStorage.removeItem('restaurant_active_order');
    }
  }, [activeOrderId]);

  // Listen for the confirmed order from the backend
  useEffect(() => {
    if (!socket) return;
    
    const handleOrderConfirmed = (order: any) => {
      setActiveOrderId(order.id);
    };
    
    socket.on('order_confirmed', handleOrderConfirmed);
    
    return () => {
      socket.off('order_confirmed', handleOrderConfirmed);
    };
  }, [socket]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

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
    // Auto-open cart when adding an item for better UX
    setIsCartOpen(true);
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

  const checkout = (tableNumber: string) => {
    if (cart.length === 0 || !socket) return;
    
    const orderData = {
      table: tableNumber,
      type: 'Dine In',
      items: cart,
      total: totalPrice
    };

    socket.emit('new_order', orderData);
    setCart([]); // Clear cart after checkout
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, 
      totalItems, totalPrice, checkout, 
      isCartOpen, toggleCart,
      activeOrderId, setActiveOrderId
    }}>
      {children}
    </CartContext.Provider>
  );
};
