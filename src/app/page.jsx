"use client";

import { useState } from "react";
import {
  Calendar,
  Users,
  Clock,
  Settings,
  Stethoscope,
  XCircle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
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

export default function ClinicDashboard() {
  const [clinicHours, setClinicHours] = useState({
    monday: {
      isOpen: true,
      shifts: [
        { start: "12:00", end: "17:00" },
        { start: "19:00", end: "22:00" },
      ],
      breaks: [],
    },
    tuesday: {
      isOpen: true,
      shifts: [
        { start: "12:00", end: "17:00" },
        { start: "19:00", end: "22:00" },
      ],
      breaks: [],
    },
    wednesday: {
      isOpen: true,
      shifts: [
        { start: "12:00", end: "17:00" },
        { start: "19:00", end: "22:00" },
      ],
      breaks: [],
    },
    thursday: {
      isOpen: true,
      shifts: [
        { start: "12:00", end: "17:00" },
        { start: "19:00", end: "22:00" },
      ],
      breaks: [],
    },
    friday: {
      isOpen: true,
      shifts: [
        { start: "12:00", end: "17:00" },
        { start: "19:00", end: "22:00" },
      ],
      breaks: [],
    },
    saturday: {
      isOpen: true,
      shifts: [
        { start: "12:00", end: "17:00" },
        { start: "19:00", end: "22:00" },
      ],
      breaks: [],
    },
    sunday: {
      isOpen: false,
      shifts: [
        { start: "12:00", end: "17:00" },
        { start: "19:00", end: "22:00" },
      ],
      breaks: [],
    },
  });

  const [appointments, setAppointments] = useState([
    // Monday, December 30, 2024
    {
      id: "1",
      patientId: "1",
      doctorId: "doc1",
      procedureId: "1",
      date: "2025-07-18",
      startTime: "12:00",
      endTime: "12:30",
      notes: "New patient consultation",
      status: "scheduled",
    },
    {
      id: "2",
      patientId: "3",
      doctorId: "doc2",
      procedureId: "4",
      date: "2025-07-18",
      startTime: "12:45",
      endTime: "13:30",
      notes: "Annual physical examination",
      status: "completed",
    },
    {
      id: "3",
      patientId: "5",
      doctorId: "doc1",
      procedureId: "2",
      date: "2025-07-18",
      startTime: "14:30",
      endTime: "14:45",
      notes: "Blood pressure follow-up",
      status: "cancelled",
    },
    {
      id: "4",
      patientId: "2",
      doctorId: "doc3",
      procedureId: "5",
      date: "2025-07-18",
      startTime: "16:00",
      endTime: "16:20",
      notes: "Lab results discussion",
      status: "missed",
    },

    // Tuesday, December 31, 2024
    {
      id: "5",
      patientId: "4",
      doctorId: "doc2",
      procedureId: "6",
      date: "2025-07-19",
      startTime: "12:30",
      endTime: "12:45",
      notes: "Flu vaccination",
      status: "scheduled",
    },
    {
      id: "6",
      patientId: "1",
      doctorId: "doc1",
      procedureId: "3",
      date: "2025-07-19",
      startTime: "15:00",
      endTime: "16:00",
      notes: "Minor surgical procedure",
      status: "scheduled",
    },
    {
      id: "7",
      patientId: "3",
      doctorId: "doc3",
      procedureId: "1",
      date: "2025-07-19",
      startTime: "16:30",
      endTime: "17:00",
      notes: "Consultation for knee pain",
      status: "completed",
    },

    // Thursday, January 2, 2025
    {
      id: "8",
      patientId: "2",
      doctorId: "doc1",
      procedureId: "2",
      date: "2025-07-16",
      startTime: "12:15",
      endTime: "12:30",
      notes: "Post-procedure follow-up",
      status: "scheduled",
    },
    {
      id: "9",
      patientId: "5",
      doctorId: "doc2",
      procedureId: "1",
      date: "2025-07-16",
      startTime: "14:00",
      endTime: "14:30",
      notes: "Diabetes management consultation",
      status: "scheduled",
    },
    {
      id: "10",
      patientId: "4",
      doctorId: "doc3",
      procedureId: "4",
      date: "2025-07-16",
      startTime: "13:15",
      endTime: "14:00",
      notes: "Pre-employment physical",
      status: "scheduled",
    },
    {
      id: "11",
      patientId: "1",
      doctorId: "doc1",
      procedureId: "5",
      date: "2025-07-16",
      startTime: "15:45",
      endTime: "16:05",
      notes: "Cholesterol test results",
      status: "completed",
    },

    // Friday, January 3, 2025
    {
      id: "12",
      patientId: "3",
      doctorId: "doc2",
      procedureId: "6",
      date: "2025-01-03",
      startTime: "09:00",
      endTime: "09:15",
      notes: "COVID booster shot",
      status: "scheduled",
    },
    {
      id: "13",
      patientId: "2",
      doctorId: "doc1",
      procedureId: "1",
      date: "2025-01-03",
      startTime: "14:30",
      endTime: "15:00",
      notes: "Headache consultation",
      status: "missed",
    },
    {
      id: "14",
      patientId: "4",
      doctorId: "doc3",
      procedureId: "2",
      date: "2025-01-03",
      startTime: "16:00",
      endTime: "16:15",
      notes: "Medication adjustment follow-up",
      status: "scheduled",
    },

    // Saturday, January 4, 2025
    {
      id: "15",
      patientId: "5",
      doctorId: "doc1",
      procedureId: "1",
      date: "2025-01-04",
      startTime: "10:30",
      endTime: "11:00",
      notes: "Weekend urgent consultation",
      status: "scheduled",
    },
    {
      id: "16",
      patientId: "1",
      doctorId: "doc2",
      procedureId: "2",
      date: "2025-01-04",
      startTime: "12:00",
      endTime: "12:15",
      notes: "Quick check-up before weekend",
      status: "cancelled",
    },
  ]);

  const [activeTab, setActiveTab] = useState("calendar");

  const statusConfig = {
    scheduled: {
      label: "Scheduled",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Clock,
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
    },
    missed: {
      label: "Missed",
      color: "bg-orange-100 text-orange-800 border-orange-200",
      icon: AlertCircle,
    },
    completed: {
      label: "Completed",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
    },
  };

  // Appointment functions
  const addAppointment = (appointment) => {
    const newAppointment = {
      ...appointment,
      id: Date.now().toString(),
    };
    setAppointments([...appointments, newAppointment]);
  };

  const updateAppointment = (appointmentId, updatedAppointment) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === appointmentId
          ? { ...updatedAppointment, id: appointmentId }
          : apt
      )
    );
  };

  const deleteAppointment = (appointmentId) => {
    setAppointments(appointments.filter((apt) => apt.id !== appointmentId));
  };

  const checkAppointmentOverlap = (
    date,
    startTime,
    endTime,
    doctorId,
    excludeId
  ) => {
    return appointments
      .filter((appt) => appt.status !== "cancelled")
      .some((apt) => {
        if (excludeId && apt.id === excludeId) return false;
        if (apt.date !== date) return false;
        // Only check for overlap with appointments for the SAME doctor
        if (apt.doctorId !== doctorId) return false;

        const aptStart = new Date(`${date}T${apt.startTime}`);
        const aptEnd = new Date(`${date}T${apt.endTime}`);
        const newStart = new Date(`${date}T${startTime}`);
        const newEnd = new Date(`${date}T${endTime}`);

        return newStart < aptEnd && newEnd > aptStart;
      });
  };

  return (
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
                <h1 className="text-2xl font-bold text-gray-900">ClinicSync</h1>
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
          <TabsList className="grid w-full grid-cols-5">
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
              value="appointments"
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Procedures
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
                  View and schedule appointments. Click on a time slot to create
                  a new appointment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AppointmentCalendar
                  appointments={appointments.filter(
                    (appt) => appt.status !== "cancelled"
                  )}
                  clinicHours={clinicHours}
                  onAddAppointment={addAppointment}
                  onUpdateAppointment={updateAppointment}
                  onDeleteAppointment={deleteAppointment}
                  onCheckOverlap={checkAppointmentOverlap}
                  statusConfig={statusConfig}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <PatientManagement />
          </TabsContent>

          <TabsContent value="doctors" className="space-y-6">
            <DoctorManagement />
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <ProcedureManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <ClinicSettings
              clinicHours={clinicHours}
              onUpdateClinicHours={setClinicHours}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
