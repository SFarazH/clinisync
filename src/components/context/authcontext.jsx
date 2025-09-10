"use client";
import { verifyUser } from "@/lib/authApi";
import React, { useState, useEffect, useContext, createContext } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkUser = async () => {
    const res = await verifyUser();
    if (res.success) {
      setAuthUser(res.user);
    } else {
      setAuthUser(null);
    }
    setIsLoading(false);
  };

  const value = {
    authUser,
    setAuthUser,
    isLoading,
    checkUser,
  };

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}
