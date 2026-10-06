import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { AUTH_CHANGED_EVENT, AUTH_EXPIRED_EVENT, clearToken, getToken } from '../utils/auth';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Use VITE_BACKEND_URL in production, fallback to localhost for local dev
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    
    const socketInstance = io(backendUrl, {
      transports: ['websocket', 'polling'],
      // Evaluated on every (re)connect so a fresh login token is picked up
      auth: (cb) => cb({ token: getToken() }),
    });

    // Server rejected an admin action: the token is missing or expired
    socketInstance.on('auth_error', () => {
      clearToken();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    });

    // Reconnect after login/logout so the server sees the new token
    const reconnect = () => {
      socketInstance.disconnect();
      socketInstance.connect();
    };
    window.addEventListener(AUTH_CHANGED_EVENT, reconnect);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to real-time server!');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from real-time server');
    });

    setSocket(socketInstance);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, reconnect);
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
