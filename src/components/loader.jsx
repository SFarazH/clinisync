"use client";
import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-white/40 z-[99999] flex items-center justify-center pointer-events-none">
      <Loader2 className="h-12 w-12 animate-spin text-gray-700" />
    </div>
  );
}
