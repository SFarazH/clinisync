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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import Image from "next/image";
import logo from "../../public/clinisync-t.png";
import { RoleBasedWrapper } from "@/components/context/role-checker";
import Loader from "@/components/loader";
import { useAuth } from "@/components/context/authcontext";
import { logOut } from "@/lib/authApi";
import { displayName } from "@/utils/helper";
import { useMutation } from "@tanstack/react-query";
import UserManagement from "@/components/user-management";

export default function ClinicDashboard() {
  const { authUser, setAuthUser } = useAuth();
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
      roles: ["pharmacist", "admin", "doctor"],
    },
    { value: "settings", label: "Settings", icon: Settings, roles: ["admin"] },
    { value: "users", label: "Users", icon: UserCog, roles: ["admin"] },
  ];

  const filteredTabs = allTabs.filter((tab) =>
    tab.roles.includes(authUser?.role)
  );

  const logoutMutation = useMutation({
    mutationFn: logOut,
    onSuccess: () => {
      setAuthUser(null);
    },
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-14  h-14 rounded-lg flex items-center justify-center">
                    <Image src={logo} alt="logo" />
                  </div>
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    ClinicSync
                  </h1>
                </div>
              </div>

              <p className="text-lg font-bold uppercase ">
                {displayName(authUser)}
              </p>

              <Button
                variant="destructive"
                className="cursor-pointer"
                onClick={logoutMutation.mutateAsync}
              >
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className={`w-full flex justify-around`}>
              {filteredTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="doctor-dashboard" className="space-y-6">
              <RoleBasedWrapper allowedRoles={["doctor"]}>
                <DoctorDashboard />
              </RoleBasedWrapper>
            </TabsContent>

            <TabsContent value="pharmacist-dashboard" className="space-y-6">
              <RoleBasedWrapper allowedRoles={["pharmacist"]}>
                <PharmacistDashboard />
              </RoleBasedWrapper>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <RoleBasedWrapper allowedRoles={["admin", "doctor"]}>
                <AppointmentCalendar />
              </RoleBasedWrapper>
            </TabsContent>

            <TabsContent value="patients" className="space-y-6">
              <RoleBasedWrapper allowedRoles={["admin", "doctor"]}>
                <PatientManagement />
              </RoleBasedWrapper>
            </TabsContent>

            <TabsContent value="doctors" className="space-y-6">
              <RoleBasedWrapper allowedRoles={["admin"]}>
                <DoctorManagement />
              </RoleBasedWrapper>
            </TabsContent>

            <TabsContent value="procedures" className="space-y-6">
              <RoleBasedWrapper allowedRoles={["admin", "doctor"]}>
                <ProcedureManagement />
              </RoleBasedWrapper>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-6">
              <RoleBasedWrapper allowedRoles={["admin"]}>
                <ListAllAppointments />
              </RoleBasedWrapper>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <RoleBasedWrapper allowedRoles={["admin"]}>
                <ClinicSettings />
              </RoleBasedWrapper>
            </TabsContent>

            <TabsContent value="prescriptions" className="space-y-6">
              <RoleBasedWrapper
                allowedRoles={["admin", "doctor", "pharmacist"]}
              >
                <PrescriptionManagement />
              </RoleBasedWrapper>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <RoleBasedWrapper allowedRoles={["admin"]}>
                <UserManagement />
              </RoleBasedWrapper>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      {logoutMutation.isPending && <Loader />}
    </ProtectedRoute>
  );
}
