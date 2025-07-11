"use client";

import { DialogFooter } from "@/components/ui/dialog";
import React from "react";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export default function AppointmentCalendar({
  appointments,
  patients,
  appointmentTypes,
  clinicHours,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  onCheckOverlap,
}) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    appointmentTypeId: "",
    notes: "",
  });
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFromCalendarSlot, setIsFromCalendarSlot] = useState(false);
  const [draggedAppointment, setDraggedAppointment] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);

  const clinicEndHour = 23;

  // Get the start of the week (Sunday)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  // Get all days of the current week
  const getWeekDays = () => {
    const weekStart = getWeekStart(currentWeek);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Generate time slots for the week (15-minute intervals grouped by 30-minute blocks)
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 11;

    // Find the latest end time across all days to determine the calendar range
    const getLatestEndTime = () => {
      let latestHour = clinicEndHour ?? 23; // default fallback

      Object.values(clinicHours).forEach((dayHours) => {
        if (dayHours.isOpen && dayHours.shifts.length > 0) {
          dayHours.shifts.forEach((shift) => {
            const endHour = Number.parseInt(shift.end.split(":")[0]);
            if (endHour > latestHour) {
              latestHour = endHour;
            }
          });
        }
      });

      return latestHour;
    };

    const endHour = getLatestEndTime();

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const isMainSlot = minute === 0 || minute === 30; // Main slots at :00 and :30
        slots.push({ time: timeString, isMainSlot, isClickable: true });
      }
    }

    // Add final boundary time (non-clickable) - one hour after the latest end time
    const boundaryHour = endHour + 1;
    const boundaryTime = `${boundaryHour.toString().padStart(2, "0")}:00`;
    slots.push({
      time: boundaryTime,
      isMainSlot: true,
      isClickable: false,
      isBoundary: true,
    });

    return slots;
  };

  // Check if a day is open based on clinic hours
  const isDayOpen = (date) => {
    const dayName = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    return (
      clinicHours[dayName]?.isOpen && clinicHours[dayName].shifts.length > 0
    );
  };

  // Check if a time slot is within clinic hours and not during breaks
  const isTimeSlotAvailable = (date, time) => {
    const dayName = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const dayHours = clinicHours[dayName];

    if (!dayHours?.isOpen || dayHours.shifts.length === 0) return false;

    const slotTime = new Date(`2000-01-01T${time}:00`);

    // Check if time is within any shift
    const isInShift = dayHours.shifts.some((shift) => {
      const shiftStart = new Date(`2000-01-01T${shift.start}:00`);
      const shiftEnd = new Date(`2000-01-01T${shift.end}:00`);
      return slotTime >= shiftStart && slotTime < shiftEnd;
    });

    if (!isInShift) return false;

    // Check if time is during a break
    const isDuringBreak = dayHours.breaks.some((breakTime) => {
      const breakStart = new Date(`2000-01-01T${breakTime.start}:00`);
      const breakEnd = new Date(`2000-01-01T${breakTime.end}:00`);
      return slotTime >= breakStart && slotTime < breakEnd;
    });

    return !isDuringBreak;
  };

  // Get appointments for a specific date and time
  const getAppointmentForSlot = (date, time) => {
    const dateString = date.toISOString().split("T")[0];
    return appointments.find((apt) => {
      if (apt.date !== dateString) return false;
      const aptStart = new Date(`2000-01-01T${apt.startTime}:00`);
      const aptEnd = new Date(`2000-01-01T${apt.endTime}:00`);
      const slotTime = new Date(`2000-01-01T${time}:00`);
      return slotTime >= aptStart && slotTime < aptEnd;
    });
  };

  // Calculate appointment height based on duration (each slot is now 15 minutes)
  const getAppointmentHeight = (appointment) => {
    const startTime = new Date(`2000-01-01T${appointment.startTime}:00`);
    const endTime = new Date(`2000-01-01T${appointment.endTime}:00`);
    const durationMinutes =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    return Math.max(1, durationMinutes / 15); // Each slot is now 15 minutes
  };

  // Check if this is the first slot of an appointment
  const isAppointmentStart = (appointment, time) => {
    return appointment.startTime === time;
  };

  const handleDragStart = (e, appointment) => {
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", appointment.id);

    // Add some visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e) => {
    setDraggedAppointment(null);
    setDragOverSlot(null);

    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
  };

  const handleDragOver = (e, date, time) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const dateString = date.toISOString().split("T")[0];
    setDragOverSlot({ date: dateString, time });
  };

  const handleDragLeave = (e) => {
    // Only clear if we're leaving the slot entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverSlot(null);
    }
  };

  const handleDrop = (e, date, time) => {
    e.preventDefault();
    setDragOverSlot(null);

    if (!draggedAppointment) return;

    const dateString = date.toISOString().split("T")[0];
    const appointmentType = appointmentTypes.find(
      (t) => t.id === draggedAppointment.appointmentTypeId
    );

    if (!appointmentType) return;

    // Calculate new end time
    const startDateTime = new Date(`${dateString}T${time}:00`);
    const endDateTime = new Date(
      startDateTime.getTime() + appointmentType.duration * 60000
    );
    const newEndTime = endDateTime.toTimeString().slice(0, 5);

    // Check if the new slot is available and within clinic hours
    if (!isTimeSlotAvailable(date, time)) {
      toast({
        title: "Invalid Drop Location",
        description:
          "Cannot schedule appointment outside of clinic hours or during breaks.",
        variant: "destructive",
      });
      return;
    }

    // Check for overlaps (exclude the current appointment being moved)
    if (onCheckOverlap(dateString, time, newEndTime, draggedAppointment.id)) {
      toast({
        title: "Scheduling Conflict",
        description: "This time slot conflicts with an existing appointment.",
        variant: "destructive",
      });
      return;
    }

    // Update the appointment
    onUpdateAppointment(draggedAppointment.id, {
      patientId: draggedAppointment.patientId,
      appointmentTypeId: draggedAppointment.appointmentTypeId,
      date: dateString,
      startTime: time,
      endTime: newEndTime,
      notes: draggedAppointment.notes,
    });

    toast({
      title: "Appointment Rescheduled",
      description: `Appointment moved to ${date.toLocaleDateString()} at ${time}`,
    });

    setDraggedAppointment(null);
  };

  const handleAppointmentClick = (appointment) => {
    const patient = patients.find((p) => p.id === appointment.patientId);
    const appointmentType = appointmentTypes.find(
      (t) => t.id === appointment.appointmentTypeId
    );

    setEditingAppointment(appointment);
    setSelectedDate(appointment.date);
    setSelectedTime(appointment.startTime);
    setFormData({
      patientId: appointment.patientId,
      appointmentTypeId: appointment.appointmentTypeId,
      notes: appointment.notes || "",
    });
    setErrorMessage(""); // Clear error message
    setIsFromCalendarSlot(false); // Mark as NOT coming from calendar slot
    setIsDialogOpen(true);
  };

  const handleTimeSlotClick = (date, time) => {
    if (!isDayOpen(date) || !isTimeSlotAvailable(date, time)) return;

    const existingAppointment = getAppointmentForSlot(date, time);
    if (existingAppointment) return; // Don't allow clicking on occupied slots

    setEditingAppointment(null); // Reset editing state
    setSelectedDate(date.toISOString().split("T")[0]);
    setSelectedTime(time);
    setFormData({ patientId: "", appointmentTypeId: "", notes: "" }); // Reset form
    setErrorMessage(""); // Clear error message
    setIsFromCalendarSlot(true); // Mark as coming from calendar slot
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (editingAppointment) {
      onDeleteAppointment(editingAppointment.id);
      toast({
        title: "Appointment Deleted",
        description: "The appointment has been successfully deleted.",
      });
      setIsDialogOpen(false);
      setEditingAppointment(null);
      setFormData({ patientId: "", appointmentTypeId: "", notes: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear any previous error

    const appointmentType = appointmentTypes.find(
      (type) => type.id === formData.appointmentTypeId
    );
    if (!appointmentType) return;

    const startTime = selectedTime;
    const startDateTime = new Date(`${selectedDate}T${startTime}:00`);
    const endDateTime = new Date(
      startDateTime.getTime() + appointmentType.duration * 60000
    );
    const endTime = endDateTime.toTimeString().slice(0, 5);

    // Check for overlaps (exclude current appointment if editing)
    if (
      onCheckOverlap(selectedDate, startTime, endTime, editingAppointment?.id)
    ) {
      setErrorMessage(
        "This time slot conflicts with an existing appointment. Please select a different time."
      );
      return;
    }

    if (editingAppointment) {
      onUpdateAppointment(editingAppointment.id, {
        patientId: formData.patientId,
        appointmentTypeId: formData.appointmentTypeId,
        date: selectedDate,
        startTime,
        endTime,
        notes: formData.notes,
      });
      toast({
        title: "Appointment Updated",
        description: "The appointment has been successfully updated.",
      });
    } else {
      onAddAppointment({
        patientId: formData.patientId,
        appointmentTypeId: formData.appointmentTypeId,
        date: selectedDate,
        startTime,
        endTime,
        notes: formData.notes,
      });
      toast({
        title: "Appointment Scheduled",
        description: "The appointment has been successfully scheduled.",
      });
    }

    setFormData({ patientId: "", appointmentTypeId: "", notes: "" });
    setEditingAppointment(null);
    setErrorMessage("");
    setIsDialogOpen(false);
  };

  const navigateWeek = (direction) => {
    setCurrentWeek((prev) => {
      const newDate = new Date(prev);
      const days = direction === "prev" ? -7 : 7;
      newDate.setDate(prev.getDate() + days);
      return newDate;
    });
  };

  const weekDays = getWeekDays();
  const timeSlots = generateTimeSlots();
  const weekStart = getWeekStart(currentWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  // Generate time options for the select dropdown based on clinic hours
  const generateTimeOptions = (date) => {
    if (!date) return [];

    const selectedDateObj = new Date(date);
    const dayName = selectedDateObj
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const dayHours = clinicHours[dayName];

    if (!dayHours?.isOpen || dayHours.shifts.length === 0) return [];

    // Find the latest end time for this specific day
    const getLatestEndTimeForDay = () => {
      let latestHour = clinicEndHour ?? 23;
      dayHours.shifts.forEach((shift) => {
        const endHour = Number.parseInt(shift.end.split(":")[0]);
        if (endHour > latestHour) {
          latestHour = endHour;
        }
      });
      return latestHour;
    };

    const endHour = getLatestEndTimeForDay();
    const options = [];

    for (let hour = 8; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        // When editing, be more permissive with time options
        if (
          editingAppointment ||
          isTimeSlotAvailable(selectedDateObj, timeString)
        ) {
          options.push(timeString);
        }
      }
    }
    return options;
  };

  const timeOptions = selectedDate ? generateTimeOptions(selectedDate) : [];

  const handleAddAppointmentClick = () => {
    setEditingAppointment(null);
    setSelectedDate("");
    setSelectedTime("");
    setFormData({ patientId: "", appointmentTypeId: "", notes: "" });
    setErrorMessage("");
    setIsFromCalendarSlot(false); // Mark as NOT coming from calendar slot
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {weekStart.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
          })}{" "}
          -{" "}
          {weekEnd.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h2>
        <div className="flex gap-2">
          <Button onClick={() => handleAddAppointmentClick()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Appointment
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("prev")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("next")}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-8 border-b">
            <div className="p-4 border-r bg-gray-50"></div>
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="p-4 text-center border-r last:border-r-0"
              >
                <div className="text-sm text-muted-foreground">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div
                  className={`text-lg font-semibold ${
                    day.toDateString() === new Date().toDateString()
                      ? "text-blue-600"
                      : ""
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          <div className="relative">
            {timeSlots.map((slot, timeIndex) => {
              const { time, isMainSlot, isClickable = true } = slot;
              return (
                <div
                  key={time}
                  className={`grid grid-cols-8 ${
                    isMainSlot
                      ? "border-b border-gray-100"
                      : "border-b-2 border-gray-200"
                  } last:border-b-0 min-h-[40px]`}
                >
                  <div
                    className={`p-2 border-r text-sm flex items-start ${
                      isMainSlot ? "font-medium" : "font-medium text-sm"
                    } ${
                      !isClickable
                        ? slot.isBoundary
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                        : ""
                    }`}
                  >
                    {slot.isBoundary ? `END - ${time}` : time}
                  </div>
                  {isClickable
                    ? weekDays.map((day, dayIndex) => {
                        const appointment = getAppointmentForSlot(day, time);
                        const isAvailable = isTimeSlotAvailable(day, time);
                        const isOpen = isDayOpen(day);

                        return (
                          <div
                            key={`${dayIndex}-${timeIndex}`}
                            className={`border-r last:border-r-0 relative ${
                              isOpen && isAvailable
                                ? "hover:bg-blue-50 cursor-pointer"
                                : "bg-gray-100"
                            } ${
                              dragOverSlot?.date ===
                                day.toISOString().split("T")[0] &&
                              dragOverSlot?.time === time &&
                              isOpen &&
                              isAvailable
                                ? "bg-green-100 border-2 border-green-400 border-dashed"
                                : ""
                            }`}
                            onClick={() => handleTimeSlotClick(day, time)}
                            onDragOver={(e) => handleDragOver(e, day, time)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, day, time)}
                          >
                            {appointment &&
                              isAppointmentStart(appointment, time) && (
                                <div
                                  draggable
                                  onDragStart={(e) =>
                                    handleDragStart(e, appointment)
                                  }
                                  onDragEnd={handleDragEnd}
                                  className="absolute inset-x-1 rounded-md p-2 text-white text-xs overflow-hidden shadow-sm cursor-move hover:shadow-md transition-shadow"
                                  style={{
                                    backgroundColor: appointmentTypes.find(
                                      (t) =>
                                        t.id === appointment.appointmentTypeId
                                    )?.color,
                                    height: `${
                                      getAppointmentHeight(appointment) * 40 - 4
                                    }px`,
                                    zIndex: 10,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAppointmentClick(appointment);
                                  }}
                                >
                                  <div className="font-medium truncate">
                                    {
                                      patients.find(
                                        (p) => p.id === appointment.patientId
                                      )?.name
                                    }
                                  </div>
                                  {/* <div className="text-xs opacity-75 truncate">
                                    {
                                      appointmentTypes.find(
                                        (t) =>
                                          t.id === appointment.appointmentTypeId
                                      )?.name
                                    }
                                  </div> */}
                                </div>
                              )}
                            {isOpen && isAvailable && !appointment && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <Plus className="w-3 h-3 text-blue-600" />
                              </div>
                            )}
                          </div>
                        );
                      })
                    : // Render non-clickable boundary slots
                      weekDays.map((day, dayIndex) => (
                        <div
                          key={`${dayIndex}-${timeIndex}`}
                          className={`border-r last:border-r-0 ${
                            slot.isBoundary ? "bg-red-100" : "bg-gray-100"
                          }`}
                        />
                      ))}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? "Edit Appointment" : "Schedule Appointment"}
            </DialogTitle>
            <DialogDescription>
              {editingAppointment ? "Edit" : "Schedule a new"} appointment
              details below.
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <div className="flex">
                <div className="text-red-800 text-sm">{errorMessage}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="patient">Patient</Label>
                <Select
                  value={formData.patientId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, patientId: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="appointmentType">Appointment Type</Label>
                <Select
                  value={formData.appointmentTypeId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, appointmentTypeId: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} ({type.duration} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isFromCalendarSlot && !editingAppointment ? (
                // Show read-only date and time ONLY when creating NEW appointment from calendar slot
                <>
                  <div className="gap-2">
                    <div className="p-3 bg-blue-50 border rounded-md flex justify-between">
                      <div className="font-medium text-blue-900 ">
                        {new Date(selectedDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-blue-700">{selectedTime}</div>
                    </div>
                  </div>
                </>
              ) : (
                // Show editable date and time fields for ALL other cases
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="time">Start Time</Label>
                    <Select
                      value={selectedTime}
                      onValueChange={setSelectedTime}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              {editingAppointment && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingAppointment(null);
                    setFormData({
                      patientId: "",
                      appointmentTypeId: "",
                      notes: "",
                    });
                    setErrorMessage(""); // Clear error message
                    setIsFromCalendarSlot(false); // Reset flag
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !formData.patientId ||
                    !formData.appointmentTypeId ||
                    !selectedTime
                  }
                >
                  {editingAppointment ? "Update" : "Schedule"} Appointment
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
