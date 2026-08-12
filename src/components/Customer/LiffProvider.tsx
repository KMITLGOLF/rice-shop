'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

interface LiffContextType {
  isLoggedIn: boolean;
  profile: LineProfile | null;
  liffError: string | null;
  login: () => void;
  logout: () => void;
  isMockUser: boolean;
}

const LiffContext = createContext<LiffContextType>({
  isLoggedIn: false,
  profile: null,
  liffError: null,
  login: () => {},
  logout: () => {},
  isMockUser: false,
});

export const useLiff = () => useContext(LiffContext);

export const LiffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [profile, setProfile] = useState<LineProfile | null>(null);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [isMockUser, setIsMockUser] = useState<boolean>(false);

  useEffect(() => {
    // Check if LIFF ID is configured
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

    if (!liffId || liffId === 'YOUR_LIFF_ID') {
      // Fallback: Initialize default mock LINE user for seamless local testing
      const mockProfile: LineProfile = {
        userId: 'U1234567890abcdef',
        displayName: 'ลูกค้าทดสอบ (LINE Customer)',
        pictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };
      setProfile(mockProfile);
      setIsLoggedIn(true);
      setIsMockUser(true);
      return;
    }

    // Dynamic import LIFF SDK
    import('@line/liff')
      .then((liffModule) => {
        const liff = liffModule.default;
        liff
          .init({ liffId })
          .then(() => {
            if (liff.isLoggedIn()) {
              setIsLoggedIn(true);
              liff.getProfile().then((p) => {
                setProfile({
                  userId: p.userId,
                  displayName: p.displayName,
                  pictureUrl: p.pictureUrl,
                  statusMessage: p.statusMessage,
                });
              });
            }
          })
          .catch((err) => {
            console.error('LIFF Initialization failed:', err);
            setLiffError(err.message);
          });
      })
      .catch((err) => {
        console.error('Failed to load LIFF SDK:', err);
      });
  }, []);

  const login = () => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId || liffId === 'YOUR_LIFF_ID') {
      // Simulate login state
      setIsLoggedIn(true);
      return;
    }

    import('@line/liff').then((liffModule) => {
      liffModule.default.login();
    });
  };

  const logout = () => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (liffId && liffId !== 'YOUR_LIFF_ID') {
      import('@line/liff').then((liffModule) => {
        liffModule.default.logout();
        setIsLoggedIn(false);
        setProfile(null);
      });
    } else {
      setIsLoggedIn(false);
      setProfile(null);
    }
  };

  return (
    <LiffContext.Provider value={{ isLoggedIn, profile, liffError, login, logout, isMockUser }}>
      {children}
    </LiffContext.Provider>
  );
};
