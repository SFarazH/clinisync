"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { daysOfWeek } from "./data";
import ClinicDayConfiguration from "./forms/clinic-day-configuration.form";

export default function ClinicSettings({ clinicHours, onUpdateClinicHours }) {
  const [selectedDay, setSelectedDay] = useState("monday");

  const updateDayOpen = (day, isOpen) => {
    onUpdateClinicHours({
      ...clinicHours,
      [day]: {
        ...clinicHours[day],
        isOpen,
      },
    });
  };

  const addShift = (day) => {
    const newShift = { start: "09:00", end: "17:00" };
    onUpdateClinicHours({
      ...clinicHours,
      [day]: {
        ...clinicHours[day],
        shifts: [...clinicHours[day].shifts, newShift],
      },
    });
    toast({
      title: "Shift Added",
      description: "New shift has been added successfully.",
    });
  };

  const updateShift = (day, shiftIndex, field, value) => {
    const updatedShifts = [...clinicHours[day].shifts];
    updatedShifts[shiftIndex] = {
      ...updatedShifts[shiftIndex],
      [field]: value,
    };
    onUpdateClinicHours({
      ...clinicHours,
      [day]: {
        ...clinicHours[day],
        shifts: updatedShifts,
      },
    });
  };

  const removeShift = (day, shiftIndex) => {
    const updatedShifts = clinicHours[day].shifts.filter(
      (_, index) => index !== shiftIndex
    );
    onUpdateClinicHours({
      ...clinicHours,
      [day]: {
        ...clinicHours[day],
        shifts: updatedShifts,
      },
    });
    toast({
      title: "Shift Removed",
      description: "Shift has been removed successfully.",
    });
  };

  const addBreak = (day) => {
    const newBreak = { start: "12:00", end: "13:00" };
    onUpdateClinicHours({
      ...clinicHours,
      [day]: {
        ...clinicHours[day],
        breaks: [...clinicHours[day].breaks, newBreak],
      },
    });
    toast({
      title: "Break Added",
      description: "New break time has been added successfully.",
    });
  };

  const updateBreak = (day, breakIndex, field, value) => {
    const updatedBreaks = [...clinicHours[day].breaks];
    updatedBreaks[breakIndex] = {
      ...updatedBreaks[breakIndex],
      [field]: value,
    };
    onUpdateClinicHours({
      ...clinicHours,
      [day]: {
        ...clinicHours[day],
        breaks: updatedBreaks,
      },
    });
  };

  const removeBreak = (day, breakIndex) => {
    const updatedBreaks = clinicHours[day].breaks.filter(
      (_, index) => index !== breakIndex
    );
    onUpdateClinicHours({
      ...clinicHours,
      [day]: {
        ...clinicHours[day],
        breaks: updatedBreaks,
      },
    });
    toast({
      title: "Break Removed",
      description: "Break time has been removed successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Clinic Working Hours & Shifts</CardTitle>
          <CardDescription>
            Configure your clinic's operating hours, shifts, and break times for
            each day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Day</h3>
              <div className="grid gap-2">
                {daysOfWeek.map(({ key, label }) => (
                  <div
                    key={key}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDay === key
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedDay(key)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{label}</span>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={clinicHours[key].isOpen}
                          onCheckedChange={(checked) =>
                            updateDayOpen(key, checked)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-sm text-muted-foreground">
                          {clinicHours[key].isOpen ? "Open" : "Closed"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <ClinicDayConfiguration
              clinicHours={clinicHours}
              selectedDay={selectedDay}
              shift={{ updateShift, addShift, removeShift }}
              breaks={{ updateBreak, addBreak, removeBreak }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
