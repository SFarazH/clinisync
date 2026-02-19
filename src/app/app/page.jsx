"use client";

import { useState } from "react";
import {
  Calendar,
  Users,
  Clock,
  Settings,
  Stethoscope,
  NotepadText,
  LayoutDashboard,
  Syringe,
  UserCog,
  FlaskConical,
  ReceiptIndianRupee,
  ShieldUser,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/context/authcontext";
import { useMutation } from "@tanstack/react-query";
import { logOut } from "@/lib";
import { RoleBasedWrapper } from "@/components/context/role-checker";
import DoctorDashboard from "@/components/doctor-dashbaord";
import PharmacistDashboard from "@/components/pharmacist-dashboard";
import AppointmentCalendar from "@/components/appointment-calendar";
import PatientManagement from "@/components/patient-management";
import DoctorManagement from "@/components/doctor-management";
import ProcedureManagement from "@/components/procedure-management";
import ListAllAppointments from "@/components/list-appointments";
import ClinicSettings from "@/components/clinic-settings";
import PrescriptionManagement from "@/components/prescription-management";
import UserManagement from "@/components/user-management";
import InvoiceManagement from "@/components/invoice-management";
import LabWorkManagement from "@/components/lab-work-management";
import ProtectedRoute from "@/components/protected-route";
import { DateRangeProvider } from "@/components/context/dateRangeContext";
import { DateRangePicker } from "@/components/date-picker";
import Image from "next/image";
import { displayName } from "@/utils/helper";
import logo from "../../../public/clinisync-t.png";
import Loader from "@/components/loader";
import { ClinicsTable } from "@/components/admin-section/clinic-management";

export default function ClinicDashboard() {
  const { authUser, setAuthUser, authClinic, setAuthClinic } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(
    authUser?.role === "super-admin"
      ? "super-admin-dashboard"
      : authUser?.role === "doctor"
        ? "doctor-dashboard"
        : authUser?.role === "pharmacist"
          ? "prescriptions"
          : "calendar",
  );

  const logoutMutation = useMutation({
    mutationFn: logOut,
    onSuccess: () => {
      setAuthUser(null);
      setAuthClinic(null);
    },
  });

  const allTabs = [
    {
      value: "super-admin-dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["super-admin"],
    },
    {
      value: "admin-users",
      label: "Admins",
      icon: ShieldUser,
      roles: ["super-admin"],
    },
    {
      value: "clinics",
      label: "Clinics",
      icon: Building2,
      roles: ["super-admin"],
    },

    {
      value: "doctor-dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["doctor"],
      featureKey: "doctors",
    },
    {
      value: "pharmacist-dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["pharmacist"],
      featureKey: "",
    },
    {
      value: "calendar",
      label: "Calendar",
      icon: Calendar,
      roles: ["admin", "receptionist", "doctor"],
      featureKey: "calendar",
    },
    {
      value: "patients",
      label: "Patients",
      icon: Users,
      roles: ["admin", "receptionist", "doctor"],
      featureKey: "patients",
    },
    {
      value: "doctors",
      label: "Doctors",
      icon: Stethoscope,
      roles: ["admin"],
      featureKey: "doctors",
    },
    {
      value: "lab-work",
      label: "Lab Work",
      icon: FlaskConical,
      roles: ["admin"],
      featureKey: "lab-work",
    },
    {
      value: "procedures",
      label: "Procedures",
      icon: Syringe,
      roles: ["admin", "doctor"],
      featureKey: "procedures",
    },
    {
      value: "appointments",
      label: "Appointments",
      icon: Clock,
      roles: ["receptionist", "admin"],
      featureKey: "appointments",
    },
    {
      value: "prescriptions",
      label: "Prescriptions",
      icon: NotepadText,
      roles: ["admin", "doctor", "pharmacist"],
      featureKey: "prescriptions",
    },
    {
      value: "settings",
      label: "Settings",
      icon: Settings,
      roles: ["admin"],
      featureKey: "settings",
    },
    {
      value: "users",
      label: "Users",
      icon: UserCog,
      roles: ["admin"],
      featureKey: "users",
    },
    {
      value: "invoices",
      label: "Invoices",
      icon: ReceiptIndianRupee,
      roles: ["admin", "receptionist"],
      featureKey: "invoices",
    },
  ];

  const renderActiveContent = () => {
    switch (activeTab) {
      case "super-admin-dashboard":
        return (
          <RoleBasedWrapper allowedRoles={["super-admin"]}>
            <h1>Super Admin</h1>
          </RoleBasedWrapper>
        );

      case "clinics":
        return (
          <RoleBasedWrapper allowedRoles={["super-admin"]}>
            <ClinicsTable />
          </RoleBasedWrapper>
        );

      case "admin-users":
        return (
          <RoleBasedWrapper allowedRoles={["super-admin"]}>
            <h1></h1>
          </RoleBasedWrapper>
        );

      case "doctor-dashboard":
        return (
          <RoleBasedWrapper allowedRoles={["doctor"]} featureKey="doctors">
            <DoctorDashboard />
          </RoleBasedWrapper>
        );
      case "pharmacist-dashboard":
        return (
          <RoleBasedWrapper allowedRoles={["pharmacist"]} featureKey="">
            <PharmacistDashboard />
          </RoleBasedWrapper>
        );
      case "calendar":
        return (
          <RoleBasedWrapper
            allowedRoles={["admin", "doctor", "receptionist"]}
            featureKey="calendar"
          >
            <AppointmentCalendar />
          </RoleBasedWrapper>
        );
      case "patients":
        return (
          <RoleBasedWrapper
            allowedRoles={["admin", "doctor", "receptionist"]}
            featureKey="patients"
          >
            <PatientManagement />
          </RoleBasedWrapper>
        );
      case "doctors":
        return (
          <RoleBasedWrapper allowedRoles={["admin"]} featureKey="doctors">
            <DoctorManagement />
          </RoleBasedWrapper>
        );
      case "procedures":
        return (
          <RoleBasedWrapper
            allowedRoles={["admin", "doctor"]}
            featureKey="procedures"
          >
            <ProcedureManagement />
          </RoleBasedWrapper>
        );
      case "appointments":
        return (
          <RoleBasedWrapper
            allowedRoles={["admin", "receptionist"]}
            featureKey="appointments"
          >
            <ListAllAppointments />
          </RoleBasedWrapper>
        );
      case "settings":
        return (
          <RoleBasedWrapper allowedRoles={["admin"]} featureKey="settings">
            <ClinicSettings />
          </RoleBasedWrapper>
        );
      case "prescriptions":
        return (
          <RoleBasedWrapper
            allowedRoles={["admin", "doctor", "pharmacist"]}
            featureKey="prescriptions"
          >
            <PrescriptionManagement />
          </RoleBasedWrapper>
        );
      case "users":
        return (
          <RoleBasedWrapper allowedRoles={["admin"]} featureKey="users">
            <UserManagement />
          </RoleBasedWrapper>
        );
      case "invoices":
        return (
          <RoleBasedWrapper
            allowedRoles={["doctor", "receptionist", "admin"]}
            featureKey="invoices"
          >
            <InvoiceManagement />
          </RoleBasedWrapper>
        );
      case "lab-work":
        return (
          <RoleBasedWrapper allowedRoles={["admin"]} featureKey="">
            <LabWorkManagement />
          </RoleBasedWrapper>
        );
      default:
        return null;
    }
  };

  const filteredTabs = allTabs.filter((tab) => {
    const hasRole = tab?.roles?.includes(authUser?.role);

    const featureEnabled = (() => {
      if (!tab.featureKey) return true; // tab not tied to a feature
      return authClinic?.features?.[tab.featureKey] === true;
    })();

    return hasRole && featureEnabled;
  });

  return (
    <ProtectedRoute>
      <DateRangeProvider>
        <div className="min-h-screen bg-gray-50 flex">
          <div
            className={`bg-white border-r transition-all duration-300 ease-in-out flex flex-col ${
              sidebarCollapsed ? "w-16" : "w-64"
            }`}
          >
            <div className="px-4 py-4 border-b flex items-center justify-between h-18">
              <div
                className={`flex items-center ${
                  sidebarCollapsed ? "justify-center" : ""
                }`}
              >
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="cursor-pointer w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-gray-100 transition-colors duration-200"
                  title={
                    sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                  }
                >
                  <Image src={logo} alt="logo" />
                </button>
                {!sidebarCollapsed && (
                  <h2 className="ml-3 text-lg font-bold text-gray-900">
                    ClinicSync
                  </h2>
                )}
              </div>
            </div>

            <nav className="flex-1 p-2">
              <ul className="space-y-1">
                {filteredTabs.map((tab) => (
                  <li key={tab.value}>
                    <button
                      onClick={() => setActiveTab(tab.value)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        activeTab === tab.value
                          ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      } ${sidebarCollapsed ? "" : ""}`}
                      title={sidebarCollapsed ? tab.label : ""}
                    >
                      <tab.icon
                        className={`w-5 h-5 ${
                          sidebarCollapsed ? "" : "mr-3"
                        } flex-shrink-0`}
                      />
                      {!sidebarCollapsed && <span>{tab.label}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex-1 flex flex-col">
            <header className="bg-white  border-b h-18">
              <div className="px-6 py-4 h-full">
                <div className="flex justify-between items-center h-full">
                  {/* LEFT SIDE: Date picker + clinic name */}
                  <div className="flex items-center gap-8">
                    {activeTab !== "calendar" ? (
                      <DateRangePicker />
                    ) : (
                      <div></div>
                    )}
                    <p className="text-xl font-semibold text-gray-800">
                      {authUser?.role === "super-admin"
                        ? "Super Admin"
                        : authClinic?.name}
                    </p>
                  </div>
                  <p className="text-lg font-bold uppercase text-gray-800">
                    {displayName(authUser)}
                  </p>
                  {/* RIGHT SIDE: user name + logout */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={logoutMutation.mutateAsync}
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-1 p-6 overflow-auto">
              <div className="h-full">{renderActiveContent()}</div>
            </main>
          </div>
        </div>
        {logoutMutation.isPending && <Loader />}
      </DateRangeProvider>
    </ProtectedRoute>
  );
}
