"use client";

import AppointmentCalendar from "@/components/appointment-calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Live Demo</h1>
          <p className="text-muted-foreground mt-1">
            Try scheduling, dragging, editing, and deleting appointments.
          </p>
          <p className="border border-red-200 w-fit p-2.5 px-4 mx-auto text-sm shadow-sm font-semibold bg-white rounded-lg my-1 text-red-500"> Select a single doctor to drag and update appointments</p>
          {/* <Alert className="w-fit mx-auto my-2 !text-xl font-bold">
            <AlertDescription className="text-xs">
              Select a single doctor to drag and update appointments
            </AlertDescription>
          </Alert> */}
        </div>

        <AppointmentCalendar mode="demo" />
      </div>
    </div>
  );
}
