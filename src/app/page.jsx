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
  ReceiptIndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PatientManagement from "@/components/patient-management";
import ClinicSettings from "@/components/clinic-settings";
import AppointmentCalendar from "@/components/appointment-calendar";
import DoctorManagement from "@/components/doctor-management";
import ProcedureManagement from "@/components/procedure-management";
import ListAllAppointments from "@/components/list-appointments";
import DoctorDashboard from "@/components/doctor-dashbaord";
import ProtectedRoute from "@/components/protected-route";
import PrescriptionManagement from "@/components/prescription-management";
import PharmacistDashboard from "@/components/pharmacist-dashboard";
import UserManagement from "@/components/user-management";
import { RoleBasedWrapper } from "@/components/context/role-checker";
import { useAuth } from "@/components/context/authcontext";
import { logOut } from "@/lib/authApi";
import { displayName } from "@/utils/helper";
import logo from "../../public/clinisync-t.png";
import Image from "next/image";
import Loader from "@/components/loader";
import { useMutation } from "@tanstack/react-query";

export default function ClinicDashboard() {
  const { authUser, setAuthUser } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(
    authUser?.role === "doctor"
      ? "doctor-dashboard"
      : authUser?.role === "pharmacist"
      ? "prescriptions"
      : "calendar"
  );

  const allTabs = [
    {
      value: "doctor-dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["doctor"],
    },
    {
      value: "pharmacist-dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["pharmacist"],
    },
    {
      value: "calendar",
      label: "Calendar",
      icon: Calendar,
      roles: ["admin", "receptionist", "doctor"],
    },
    {
      value: "patients",
      label: "Patients",
      icon: Users,
      roles: ["admin", "receptionist", "doctor"],
    },
    { value: "doctors", label: "Doctors", icon: Stethoscope, roles: ["admin"] },
    {
      value: "procedures",
      label: "Procedures",
      icon: Syringe,
      roles: ["admin", "doctor"],
    },
    {
      value: "appointments",
      label: "Appointments",
      icon: Clock,
      roles: ["receptionist", "admin"],
    },
    {
      value: "prescriptions",
      label: "Prescriptions",
      icon: NotepadText,
      roles: ["admin", "doctor", "pharmacist"],
    },
    { value: "settings", label: "Settings", icon: Settings, roles: ["admin"] },
    { value: "users", label: "Users", icon: UserCog, roles: ["admin"] },
    { value: "accounts", label: "Accounts", icon: ReceiptIndianRupee, roles: ["admin"] },
  ];

  const logoutMutation = useMutation({
    mutationFn: logOut,
    onSuccess: () => {
      setAuthUser(null);
    },
  });

  const filteredTabs = allTabs.filter((tab) =>
    tab.roles.includes(authUser?.role)
  );

  const renderActiveContent = () => {
    switch (activeTab) {
      case "doctor-dashboard":
        return (
          <RoleBasedWrapper allowedRoles={["doctor"]}>
            <DoctorDashboard />
          </RoleBasedWrapper>
        );
      case "pharmacist-dashboard":
        return (
          <RoleBasedWrapper allowedRoles={["pharmacist"]}>
            <PharmacistDashboard />
          </RoleBasedWrapper>
        );
      case "calendar":
        return (
          <RoleBasedWrapper allowedRoles={["admin", "doctor", "receptionist"]}>
            <AppointmentCalendar />
          </RoleBasedWrapper>
        );
      case "patients":
        return (
          <RoleBasedWrapper allowedRoles={["admin", "doctor", "receptionist"]}>
            <PatientManagement />
          </RoleBasedWrapper>
        );
      case "doctors":
        return (
          <RoleBasedWrapper allowedRoles={["admin"]}>
            <DoctorManagement />
          </RoleBasedWrapper>
        );
      case "procedures":
        return (
          <RoleBasedWrapper allowedRoles={["admin", "doctor"]}>
            <ProcedureManagement />
          </RoleBasedWrapper>
        );
      case "appointments":
        return (
          <RoleBasedWrapper allowedRoles={["admin", "receptionist"]}>
            <ListAllAppointments />
          </RoleBasedWrapper>
        );
      case "settings":
        return (
          <RoleBasedWrapper allowedRoles={["admin"]}>
            <ClinicSettings />
          </RoleBasedWrapper>
        );
      case "prescriptions":
        return (
          <RoleBasedWrapper allowedRoles={["admin", "doctor", "pharmacist"]}>
            <PrescriptionManagement />
          </RoleBasedWrapper>
        );
      case "users":
        return (
          <RoleBasedWrapper allowedRoles={["admin"]}>
            <UserManagement />
          </RoleBasedWrapper>
        );
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        <div
          className={`bg-white border-r transition-all duration-300 ease-in-out flex flex-col ${
            sidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          {/* Sidebar Header */}
          <div className="px-4 py-4 border-b flex items-center justify-between h-18">
            <div
              className={`flex items-center ${
                sidebarCollapsed ? "justify-center" : ""
              }`}
            >
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="cursor-pointer w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-gray-100 transition-colors duration-200"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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

          {/* Navigation Menu */}
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
                    } ${sidebarCollapsed ? "justify-center" : ""}`}
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

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Main Header */}
          <header className="bg-white  border-b h-18">
            <div className="px-6 py-4 h-full">
              <div className="flex justify-between items-center h-full">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {filteredTabs.find((tab) => tab.value === activeTab)
                      ?.label || "Dashboard"}
                  </h1>
                </div>
                <p className="text-lg font-bold uppercase text-gray-800">
                  {displayName(authUser)}
                </p>
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
    </ProtectedRoute>
  );
}
