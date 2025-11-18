"use client";

import { useAuth } from "@/components/context/authcontext";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { authUser } = useAuth();

  useEffect(() => {
    if (authUser) {
      redirect("/app");
    }
  }, [authUser]);

  return (
    <>
      <h1>Welcome to CliniSync</h1>
      <button className="cursor-pointer" onClick={() => redirect("/login")}>
        login
      </button>
    </>
  );
}
