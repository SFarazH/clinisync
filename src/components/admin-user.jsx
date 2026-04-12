"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import UserForm from "./forms/user.form";

export default function AdminUser() {
  const [open, setOpen] = useState(false);

  //   const adminTemplate = {
  //     ...emptyUser,
  //     role: "admin",
  //   };

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Add Admin</Button>

      <UserForm
        isOpen={open}
        onClose={() => setOpen(false)}
        user={null}
        superAdmin={true}
      />
    </>
  );
}
