"use client";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./context/authcontext";
import Loader from "./loader";

export default function ProtectedRoute({ children }) {
  const { authUser, isLoading } = useAuth();

  useEffect(() => {
    if (!authUser) {
      redirect("/");
    }
  }, [isLoading, authUser]);

  if (isLoading || !authUser) {
    return <Loader />;
  }

  return children;
}
