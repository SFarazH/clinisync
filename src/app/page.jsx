"use client";

import { useAuth } from "@/components/context/authcontext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  CheckCircle2,
  ReceiptIndianRupee,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import logo from "../../public/clinisync-t.png";
import Image from "next/image";
import CarouselSection from "@/components/Features";

export default function Home() {
  const { authUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authUser) {
      router.push("/app");
    }
  }, [authUser, router]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-foreground">
                CliniSync
              </span>
            </div> */}
            <div className={`flex items-center`}>
              <div className="cursor-pointer w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                <Image src={logo} alt="logo" />
              </div>

              <h2 className="ml-3 text-2xl font-bold text-gray-900">
                ClinicSync
              </h2>
            </div>
            <div className="hidden md:flex items-center gap-8">
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
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer"
                onClick={() => router.push("/login")}
              >
                Sign In
              </Button>

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

      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-blue-50 pt-20 pb-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="inline-block">
              {/* <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-sm text-blue-700">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Trusted by 500+ Healthcare Organizations
              </span> */}
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground text-balance">
              Optimizing{" "}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Healthcare
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed text-balance">
              Empower your team with <b className="font-semibold">CliniSync</b>.{" "}
              <br />
              <span>
                {" "}
                Streamline patient management, appointment scheduling, invoices,
                and much more in one platform built for healthcare
                professionals.
              </span>
            </p>

            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="bg-primary text-white hover:bg-blue-700 gap-2"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 bg-transparent"
              >
                Request a Demo
              </Button>
            </div> */}

            {/* <div className="pt-8 text-sm text-muted-foreground"> */}
            {/* <p>• ✓ 14-day free trial •</p> */}
            {/* </div> */}
          </div>
        </div>
      </section>

      <section className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">3</div>
              <p className="text-sm text-muted-foreground mt-1">
                Active Clinics
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100+</div>
              <p className="text-sm text-muted-foreground mt-1">
                Patients Managed
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <p className="text-sm text-muted-foreground mt-1">Uptime SLA</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">4</div>
              <p className="text-sm text-muted-foreground mt-1">
                Roles supported
              </p>
            </div>
          </div>
        </div>
      </section>

      <CarouselSection />

      <section id="features" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">
              Everything You Need to Run Your Clinic
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              All-in-one platform designed specifically for dental and
              healthcare organizations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Smart Patient Management"
              description="Maintain patient records, medical history, and demographics in a secure and organized manner."
            />

            <FeatureCard
              icon={<Calendar className="w-6 h-6" />}
              title="Appointment Scheduling"
              description="Simplify booking, managing, and rescheduling appointments with real-time availability."
            />

            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Lab Work Tracking"
              description="Monitor and confirm lab work status for patients efficiently with automated notifications."
            />

            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Role-Based Access Control"
              description="Secure access for admins, doctors, and staff with permission-based visibility and auditing."
            />

            <FeatureCard
              icon={<CheckCircle2 className="w-6 h-6" />}
              title="Performance Dashboards"
              description="Visual insights into clinic operations, team performance, and detailed daily reports."
            />

            <FeatureCard
              icon={<ReceiptIndianRupee className="w-6 h-6" />}
              title="Automatic Invoice Management"
              description="Streamline payments with invoice generation and tracking."
            />
          </div>
        </div>
      </section>

      <section className="py-15 bg-blue-50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Enterprise-Grade Security
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">
                    Patient attachments stored securely in cloud based AWS S3
                    with full encryption at rest and in transit.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">
                    Multi tenant architecture implemented to ensure eah clinic's
                    data remains isolated.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">
                    Role-based access control to ensure authorized access to
                    sensitive data.
                  </span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg flex justify-center">
              <img
                src="/security.svg"
                alt="Security Features"
                className="h-auto w-1/2"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {/* <section id="testimonials" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">
              Loved by Healthcare Professionals
            </h2>
            <p className="text-lg text-muted-foreground">
              See what clinic managers and healthcare teams are saying about
              CliniSync
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="CliniSync has transformed how we manage our clinic. Patient scheduling is now seamless, and we've reduced administrative time by 40%."
              author="Dr. Sarah Chen"
              role="Dental Clinic Owner"
            />
            <TestimonialCard
              quote="The HIPAA compliance features give us peace of mind. Our staff loves how intuitive the interface is, and patient feedback has been overwhelmingly positive."
              author="James Martinez"
              role="Healthcare Operations Manager"
            />
            <TestimonialCard
              quote="Integration with our banking system was effortless. Financial reporting is now real-time, making it easier to track clinic profitability."
              author="Emily Watson"
              role="Clinic Administrator"
            />
          </div>
        </div>
      </section> */}

      {/* Different plans */}
      {/* <section id="pricing" className="py-20 bg-blue-50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that fits your clinic's needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard
              name="Basic"
              price="$299"
              description="Perfect for small clinics"
              features={[
                "Up to 100 patients",
                "Basic appointment scheduling",
                "Patient records & history",
                "Email support",
                "1 user account",
              ]}
              cta="Get Started"
            />
            <PricingCard
              name="Professional"
              price="$799"
              description="Most popular for growing clinics"
              features={[
                "Up to 1,000 patients",
                "Advanced scheduling & reminders",
                "Lab work tracking",
                "Role-based access control",
                "Up to 10 user accounts",
                "Priority support",
              ]}
              cta="Start Free Trial"
              highlight={true}
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              description="For large healthcare organizations"
              features={[
                "Unlimited patients",
                "All Professional features",
                "Bank account integration",
                "Custom integrations",
                "Unlimited user accounts",
                "24/7 dedicated support",
              ]}
              cta="Contact Sales"
            />
          </div>
        </div>
      </section> */}

      <section className="py-20 bg-gradient-to-r from-primary to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6 text-balance">
            Ready to Streamline Your Clinic?
          </h2>
          <p className="text-xl text-blue-50 mb-8">
            Join hundreds of healthcare organizations using CliniSync to improve
            efficiency and patient care.
          </p>
          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-blue-50 gap-2"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white/10 bg-transparent"
            >
              Schedule a Demo
            </Button>
          </div> */}
        </div>
      </section>

      {/* <footer className="bg-foreground text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg">CliniSync</span>
              </div>
              <p className="text-sm text-gray-400">
                Clinic management made simple for healthcare professionals.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    HIPAA
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Compliance
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Follow</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2025 CliniSync. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition">
                Cookie Settings
              </a>
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card className="p-6 border border-border hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </Card>
  );
}

function TestimonialCard({ quote, author, role, image }) {
  return (
    <Card className="p-6 border border-border">
      <div className="flex items-start gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-yellow-400">
            ★
          </span>
        ))}
      </div>
      <p className="text-foreground mb-4 leading-relaxed italic">"{quote}"</p>
      <div className="flex items-center gap-3">
        <img
          src={image || "/placeholder.svg"}
          alt={author}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold text-foreground text-sm">{author}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </Card>
  );
}

function PricingCard({ name, price, description, features, cta, highlight }) {
  return (
    <Card
      className={`p-8 border transition-all ${
        highlight
          ? "border-primary ring-2 ring-primary shadow-xl scale-105"
          : "border-border"
      }`}
    >
      {highlight && (
        <span className="inline-block bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Most Popular
        </span>
      )}
      <h3 className="text-2xl font-bold text-foreground mb-2">{name}</h3>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      <div className="mb-6">
        <span className="text-4xl font-bold text-foreground">{price}</span>
        {price !== "Custom" && (
          <span className="text-muted-foreground text-sm">/month</span>
        )}
      </div>
      <Button
        className={`w-full mb-6 ${
          highlight
            ? "bg-primary text-white hover:bg-blue-700"
            : "border border-border text-foreground hover:bg-blue-50"
        }`}
      >
        {cta}
      </Button>
      <ul className="space-y-3">
        {features.map((feature, i) => (
          <li
            key={i}
            className="flex items-center gap-2 text-sm text-foreground"
          >
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
    </Card>
  );
}
