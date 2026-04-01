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
  const [authClinic, setAuthClinic] = useState(null);

  const checkUser = async () => {
    try {
      const user = await verifyUser();
      setAuthUser(user?.data);
      setAuthClinic(user?.data?.clinic);
    } catch (error) {
      setAuthUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    authUser,
    setAuthUser,
    isLoading,
    checkUser,
    authClinic,
    setAuthClinic,
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
