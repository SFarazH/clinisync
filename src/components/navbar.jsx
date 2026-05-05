"use client";

import { Button } from "./ui/button";
import logo from "../../public/clinisync-t.png";
import Image from "next/image";
import Link from "next/link";

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        <Link href="/" className="flex items-center">
          <Image src={logo} alt="logo" className="w-10 h-10" />
          <h2 className="ml-2 text-xl font-semibold">
            <span className="text-[#3878ca]">Clini</span>
            <span className="text-[#74c92a]">Sync</span>
          </h2>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            href="#features"
            className="text-sm text-gray-500 hover:text-[#3878ca] transition-colors"
          >
            Features
          </Link>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-700 hover:text-[#3878ca]"
            asChild
          >
            <Link href="/login">Sign In</Link>
          </Button>

          <Button
            asChild
            className="bg-[#3878ca] hover:bg-[#2f66ad] text-white px-5"
          >
            <Link href="/demo">Demo</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};
