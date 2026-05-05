"use client";

import { Button } from "./ui/button";
import logo from "../../public/clinisync-t.png";
import Image from "next/image";
import Link from "next/link";

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <div className={`flex items-center`}>
              <div className="cursor-pointer w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                <Image src={logo} alt="logo" />
              </div>

              <h2 className="ml-3 text-2xl font-bold text-gray-900">
                <span className="text-[#3878ca]">Clini</span>
                <span className="text-[#74c92a]">Sync</span>
              </h2>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/demo">
              <Button className="cursor-pointer bg-[#3878ca] hover:bg-[#0f51a6]">
                DEMO
              </Button>
            </Link>
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Features
            </a>
            {/* <a
                href="#pricing"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Pricing
              </a> */}
            {/* <a
                href="#testimonials"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Testimonials
              </a> */}
            <Link href="/login">
              <Button variant="ghost" size="sm" className="cursor-pointer">
                Sign In
              </Button>
            </Link>

            {/* <Button
                size="sm"
                className="bg-primary text-white hover:bg-blue-700"
              >
                Get Started
              </Button> */}
          </div>
        </div>
      </div>
    </nav>
  );
};
