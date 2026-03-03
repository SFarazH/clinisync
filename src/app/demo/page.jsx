"use client";

import AppointmentCalendar from "@/components/appointment-calendar";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Live Demo</h1>
          <p className="text-muted-foreground mt-1">
            Try scheduling, dragging, editing, and deleting appointments. This
            demo runs fully locally — no data is saved.
          </p>
        </div>

        <AppointmentCalendar mode="demo" />
      </div>
    </div>
  );
}
