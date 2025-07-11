"use client";

import { useState } from "react";
import { Calendar, Users, Clock, Settings, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PatientManagement from "@/components/patient-management";
import AppointmentTypes from "@/components/appointment-types";
import ClinicSettings from "@/components/clinic-settings";
import AppointmentCalendar from "@/components/appointment-calendar";

export default function ClinicDashboard() {
  const [patients, setPatients] = useState([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      dateOfBirth: "1990-05-15",
      address: "123 Main St, City, State",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1234567891",
      dateOfBirth: "1985-08-22",
      address: "456 Oak Ave, City, State",
    },
    {
      id: "3",
      name: "Michael Johnson",
      email: "michael.j@example.com",
      phone: "+1234567892",
      dateOfBirth: "1978-12-03",
      address: "789 Pine St, City, State",
    },
    {
      id: "4",
      name: "Sarah Williams",
      email: "sarah.w@example.com",
      phone: "+1234567893",
      dateOfBirth: "1992-07-18",
      address: "321 Elm St, City, State",
    },
    {
      id: "5",
      name: "Robert Brown",
      email: "robert.brown@example.com",
      phone: "+1234567894",
      dateOfBirth: "1965-03-25",
      address: "654 Maple Ave, City, State",
    },
  ]);

  const [appointmentTypes, setAppointmentTypes] = useState([
    {
      id: "1",
      name: "General Consultation",
      duration: 30,
      color: "#3b82f6",
    },
    {
      id: "2",
      name: "Follow-up",
      duration: 15,
      color: "#10b981",
    },
    {
      id: "3",
      name: "Procedure",
      duration: 60,
      color: "#f59e0b",
    },
    {
      id: "4",
      name: "Physical Exam",
      duration: 45,
      color: "#ef4444",
    },
    {
      id: "5",
      name: "Lab Results Review",
      duration: 20,
      color: "#8b5cf6",
    },
    {
      id: "6",
      name: "Vaccination",
      duration: 15,
      color: "#06b6d4",
    },
  ]);

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
      appointmentTypeId: "1",
      date: "2024-12-30",
      startTime: "09:00",
      endTime: "09:30",
      notes: "New patient consultation",
    },
    {
      id: "2",
      patientId: "3",
      appointmentTypeId: "4",
      date: "2024-12-30",
      startTime: "10:15",
      endTime: "11:00",
      notes: "Annual physical examination",
    },
    {
      id: "3",
      patientId: "5",
      appointmentTypeId: "2",
      date: "2024-12-30",
      startTime: "14:30",
      endTime: "14:45",
      notes: "Blood pressure follow-up",
    },
    {
      id: "4",
      patientId: "2",
      appointmentTypeId: "5",
      date: "2024-12-30",
      startTime: "16:00",
      endTime: "16:20",
      notes: "Lab results discussion",
    },

    // Tuesday, December 31, 2024
    {
      id: "5",
      patientId: "4",
      appointmentTypeId: "6",
      date: "2024-12-31",
      startTime: "09:30",
      endTime: "09:45",
      notes: "Flu vaccination",
    },
    {
      id: "6",
      patientId: "1",
      appointmentTypeId: "3",
      date: "2024-12-31",
      startTime: "15:00",
      endTime: "16:00",
      notes: "Minor surgical procedure",
    },
    {
      id: "7",
      patientId: "3",
      appointmentTypeId: "1",
      date: "2024-12-31",
      startTime: "16:30",
      endTime: "17:00",
      notes: "Consultation for knee pain",
    },

    // Thursday, January 2, 2025
    {
      id: "8",
      patientId: "2",
      appointmentTypeId: "2",
      date: "2025-01-02",
      startTime: "09:15",
      endTime: "09:30",
      notes: "Post-procedure follow-up",
    },
    {
      id: "9",
      patientId: "5",
      appointmentTypeId: "1",
      date: "2025-01-02",
      startTime: "10:00",
      endTime: "10:30",
      notes: "Diabetes management consultation",
    },
    {
      id: "10",
      patientId: "4",
      appointmentTypeId: "4",
      date: "2025-01-02",
      startTime: "13:15",
      endTime: "14:00",
      notes: "Pre-employment physical",
    },
    {
      id: "11",
      patientId: "1",
      appointmentTypeId: "5",
      date: "2025-01-02",
      startTime: "15:45",
      endTime: "16:05",
      notes: "Cholesterol test results",
    },

    // Friday, January 3, 2025
    {
      id: "12",
      patientId: "3",
      appointmentTypeId: "6",
      date: "2025-01-03",
      startTime: "09:00",
      endTime: "09:15",
      notes: "COVID booster shot",
    },
    {
      id: "13",
      patientId: "2",
      appointmentTypeId: "1",
      date: "2025-01-03",
      startTime: "14:30",
      endTime: "15:00",
      notes: "Headache consultation",
    },
    {
      id: "14",
      patientId: "4",
      appointmentTypeId: "2",
      date: "2025-01-03",
      startTime: "16:00",
      endTime: "16:15",
      notes: "Medication adjustment follow-up",
    },

    // Saturday, January 4, 2025
    {
      id: "15",
      patientId: "5",
      appointmentTypeId: "1",
      date: "2025-01-04",
      startTime: "10:30",
      endTime: "11:00",
      notes: "Weekend urgent consultation",
    },
    {
      id: "16",
      patientId: "1",
      appointmentTypeId: "2",
      date: "2025-01-04",
      startTime: "12:00",
      endTime: "12:15",
      notes: "Quick check-up before weekend",
    },
  ]);

  const [activeTab, setActiveTab] = useState("calendar");

  // Patient functions
  const addPatient = (patient) => {
    const newPatient = {
      ...patient,
      id: Date.now().toString(),
    };
    setPatients([...patients, newPatient]);
  };

  const updatePatient = (patientId, updatedPatient) => {
    setPatients(
      patients.map((patient) =>
        patient.id === patientId
          ? { ...updatedPatient, id: patientId }
          : patient
      )
    );
  };

  const deletePatient = (patientId) => {
    setPatients(patients.filter((patient) => patient.id !== patientId));
  };

  // Appointment type functions
  const addAppointmentType = (appointmentType) => {
    const newAppointmentType = {
      ...appointmentType,
      id: Date.now().toString(),
    };
    setAppointmentTypes([...appointmentTypes, newAppointmentType]);
  };

  const updateAppointmentType = (appointmentTypeId, updatedAppointmentType) => {
    setAppointmentTypes(
      appointmentTypes.map((type) =>
        type.id === appointmentTypeId
          ? { ...updatedAppointmentType, id: appointmentTypeId }
          : type
      )
    );
  };

  const deleteAppointmentType = (appointmentTypeId) => {
    setAppointmentTypes(
      appointmentTypes.filter((type) => type.id !== appointmentTypeId)
    );
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

  const checkAppointmentOverlap = (date, startTime, endTime, excludeId) => {
    return appointments.some((apt) => {
      if (excludeId && apt.id === excludeId) return false;
      if (apt.date !== date) return false;

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
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">ClinicSync</h1>
                <p className="text-sm text-gray-500">
                  Clinic Management System
                </p>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Patients
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Appointment Types
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
                  appointments={appointments}
                  patients={patients}
                  appointmentTypes={appointmentTypes}
                  clinicHours={clinicHours}
                  onAddAppointment={addAppointment}
                  onUpdateAppointment={updateAppointment}
                  onDeleteAppointment={deleteAppointment}
                  onCheckOverlap={checkAppointmentOverlap}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <PatientManagement
              patients={patients}
              onAddPatient={addPatient}
              onUpdatePatient={updatePatient}
              onDeletePatient={deletePatient}
            />
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <AppointmentTypes
              appointmentTypes={appointmentTypes}
              onAddAppointmentType={addAppointmentType}
              onUpdateAppointmentType={updateAppointmentType}
              onDeleteAppointmentType={deleteAppointmentType}
            />
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
