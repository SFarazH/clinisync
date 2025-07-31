"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./context/authcontext";
import Loader from "./loader";

export default function ProtectedRoute({ children }) {
  const { authUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authUser) {
      router.replace("/login");
    }
  }, [isLoading, authUser, router]);

  if (isLoading || !authUser) {
    return <Loader />;
  }

  return children;
}
