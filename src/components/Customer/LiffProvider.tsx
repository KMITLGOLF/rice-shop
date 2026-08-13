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
  accessToken: string | null;
  liffError: string | null;
  login: () => void;
  logout: () => void;
  updateProfile: (profile: Pick<LineProfile, 'displayName'>) => void;
  isMockUser: boolean;
}

const LiffContext = createContext<LiffContextType>({
  isLoggedIn: false,
  profile: null,
  accessToken: null,
  liffError: null,
  login: () => {},
  logout: () => {},
  updateProfile: () => {},
  isMockUser: false,
});

export const useLiff = () => useContext(LiffContext);

export const LiffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [profile, setProfile] = useState<LineProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [isMockUser] = useState<boolean>(false);

  useEffect(() => {
    // Check if LIFF ID is configured
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

    if (!liffId || liffId === 'YOUR_LIFF_ID') {
      setLiffError('ยังไม่ได้ตั้งค่า LINE Login');
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
              setAccessToken(liff.getAccessToken());
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
      setLiffError('ไม่สามารถเข้าสู่ระบบได้ กรุณาตั้งค่า NEXT_PUBLIC_LIFF_ID');
      return;
    }

    import('@line/liff').then((liffModule) => {
      const liff = liffModule.default;
      // LIFF keeps the customer inside LINE when launched from LINE. Do not
      // open a second LIFF URL here: doing so creates nested iOS web views.
      // The redirect URI preserves the current page after authentication.
      liff.login({ redirectUri: window.location.href });
    });
  };

  const logout = () => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (liffId && liffId !== 'YOUR_LIFF_ID') {
      import('@line/liff').then((liffModule) => {
        liffModule.default.logout();
        setIsLoggedIn(false);
        setProfile(null);
        setAccessToken(null);
      });
    } else {
      setIsLoggedIn(false);
      setProfile(null);
      setAccessToken(null);
    }
  };

  const updateProfile = (updates: Pick<LineProfile, 'displayName'>) => {
    setProfile((current) => (current ? { ...current, ...updates } : current));
  };

  return (
    <LiffContext.Provider value={{ isLoggedIn, profile, accessToken, liffError, login, logout, updateProfile, isMockUser }}>
      {children}
    </LiffContext.Provider>
  );
};
