import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const { socket } = useSocket();

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

  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === newItem.id);
      if (existing) {
        return prev.map(item => item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
    // Auto-open cart when adding an item for better UX
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
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
    alert(`Order sent to Kitchen! Your table is ${tableNumber}.`);
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
