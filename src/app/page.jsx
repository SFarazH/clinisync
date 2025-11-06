"use client";

import { redirect } from "next/navigation";

export default function ClinicDashboard() {
  const { authUser } = useAuth();

  useEffect(() => {
    if (authUser) {
      redirect("/app");
    }
  }, [authUser]);

  return <h1>Welcome to CliniSync</h1>;
}
