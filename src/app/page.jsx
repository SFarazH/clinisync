"use client";

import { useState } from "react";
import { Calendar, Users, Clock, Settings, Stethoscope } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PatientManagement from "@/components/patient-management";
import ClinicSettings from "@/components/clinic-settings";
import AppointmentCalendar from "@/components/appointment-calendar";
import DoctorManagement from "@/components/doctor-management";
import Image from "next/image";
import logo from "../../public/clinisync-t.png";
import ProcedureManagement from "@/components/procedure-management";
import ListAllAppointments from "@/components/list-appointments";
import ProtectedRoute from "@/components/protected-route";

export default function ClinicDashboard() {
  const [activeTab, setActiveTab] = useState("calendar");

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
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="patients" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Patients
              </TabsTrigger>
              <TabsTrigger value="doctors" className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Doctors
              </TabsTrigger>
              <TabsTrigger
                value="procedures"
                className="flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Procedures
              </TabsTrigger>
              <TabsTrigger
                value="appointments"
                className="flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Calendar</CardTitle>
                  <CardDescription>
                    View and schedule appointments. Click on a time slot to
                    create a new appointment.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AppointmentCalendar />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patients" className="space-y-6">
              <PatientManagement />
            </TabsContent>

            <TabsContent value="doctors" className="space-y-6">
              <DoctorManagement />
            </TabsContent>

            <TabsContent value="procedures" className="space-y-6">
              <ProcedureManagement />
            </TabsContent>

            <TabsContent value="appointments" className="space-y-6">
              <ListAllAppointments />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <ClinicSettings />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
}
