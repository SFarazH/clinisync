"use client";
import React, { useEffect } from "react";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, ChevronsUpDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { fetchDoctors, fetchPatients, fetchProceudres } from "@/lib";
import { appointmentStatusConfig, emptyAppointment } from "./data";
import {
  generateTimeSlots,
  getAppointmentColor,
  getAppointmentHeight,
  getWeekDays,
  getWeekStart,
  isDayOpen,
  isTimeSlotAvailable,
} from "../utils/helper";
import AppointmentForm from "./forms/appointment.form";
import MergedAppointmentsDialog from "./forms/merged-appointments";

export default function AppointmentCalendar({
  appointments,
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
  const [selectedDoctorId, setSelectedDoctorId] = useState("all");
  const [formData, setFormData] = useState(emptyAppointment);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFromCalendarSlot, setIsFromCalendarSlot] = useState(false);
  const [draggedAppointment, setDraggedAppointment] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [overlappingAppointmentsDialog, setOverlappingAppointmentsDialog] =
    useState({
      isOpen: false,
      appointments: [],
      timeSlot: "",
      date: "",
    });
  const [mergedAppointments, setMergedAppointments] = useState([]);
  const [open, setOpen] = useState(false);

  const { data: patientsData = [], isLoading: loadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: fetchPatients,
  });

  const { data: doctorsData = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: fetchDoctors,
  });

  const { data: proceduresData = [], isLoading: loadingProcedures } = useQuery({
    queryKey: ["procedures"],
    queryFn: fetchProceudres,
  });

  const slotsStartHour = 9;
  const slotsEndHour = 23;

  const getSingleAppointmentForSlot = (date, time) => {
    const dateString = date.toISOString().split("T")[0];

    const appointmentsToConsider =
      selectedDoctorId === "all"
        ? appointments
        : appointments.filter((apt) => apt.doctorId === selectedDoctorId);

    return appointmentsToConsider.find((apt) => {
      if (apt.date !== dateString) return false;
      const aptStart = new Date(`2000-01-01T${apt.startTime}:00`);
      const aptEnd = new Date(`2000-01-01T${apt.endTime}:00`);
      const slotTimeObj = new Date(`2000-01-01T${time}:00`);
      return slotTimeObj >= aptStart && slotTimeObj < aptEnd;
    });
  };

  // Get all appointments that overlap with a specific 15-minute slot for the combined view.
  const getAppointmentsForCombinedSlot = (date, slotTime) => {
    const dateString = date.toISOString().split("T")[0];
    const currentSlotStart = new Date(`2000-01-01T${slotTime}:00`);
    const currentSlotEnd = new Date(currentSlotStart.getTime() + 15 * 60000);

    return appointments.filter((apt) => {
      if (apt.date !== dateString) return false;
      const aptStart = new Date(`2000-01-01T${apt.startTime}:00`);
      const aptEnd = new Date(`2000-01-01T${apt.endTime}:00`);

      // Check for overlap: (startA < endB) && (endA > startB)
      return aptStart < currentSlotEnd && aptEnd > currentSlotStart;
    });
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
    const procedure = proceduresData.find(
      (t) => t._id === draggedAppointment.procedureId
    );

    if (!procedure) return;

    // Calculate new end time
    const startDateTime = new Date(`${dateString}T${time}:00`);
    const endDateTime = new Date(
      startDateTime.getTime() + procedure.duration * 60000
    );
    const newEndTime = endDateTime.toTimeString().slice(0, 5);

    // Check if the new slot is available and within clinic hours
    if (!isTimeSlotAvailable(date, time, clinicHours)) {
      toast({
        title: "Invalid Drop Location",
        description:
          "Cannot schedule appointment outside of clinic hours or during breaks.",
        variant: "destructive",
      });
      return;
    }

    // Check for overlaps with the same doctor (exclude the current appointment being moved)
    if (
      onCheckOverlap(
        dateString,
        time,
        newEndTime,
        draggedAppointment.doctorId,
        draggedAppointment.id
      )
    ) {
      toast({
        title: "Scheduling Conflict",
        description:
          "This time slot conflicts with an existing appointment for this doctor.",
        variant: "destructive",
      });
      return;
    }

    // Update the appointment
    onUpdateAppointment(draggedAppointment.id, {
      patientId: draggedAppointment.patientId,
      doctorId: draggedAppointment.doctorId,
      procedureId: draggedAppointment.procedureId,
      date: dateString,
      startTime: time,
      endTime: newEndTime,
      notes: draggedAppointment.notes,
      status: draggedAppointment.status || "scheduled",
    });

    toast({
      title: "Appointment Rescheduled",
      description: `Appointment moved to ${date.toLocaleDateString()} at ${time}`,
    });

    setDraggedAppointment(null);
  };

  const handleAppointmentClick = (appointment) => {
    setEditingAppointment(appointment);
    setSelectedDate(appointment.date);
    setSelectedTime(appointment.startTime);
    setFormData({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      procedureId: appointment.procedureId,
      notes: appointment.notes || "",
      status: appointment.status || "scheduled",
    });
    setErrorMessage(""); // Clear error message
    setIsFromCalendarSlot(false); // Mark as NOT coming from calendar slot
    setIsDialogOpen(true);
  };

  // get appointment type color

  // add appointment using empty time slot in calendar view
  const handleTimeSlotClick = (date, time) => {
    if (
      !isDayOpen(date, clinicHours) ||
      !isTimeSlotAvailable(date, time, clinicHours)
    )
      return;
    // In individual view, prevent clicking on occupied slots
    if (selectedDoctorId !== "all") {
      const existingAppointment = getSingleAppointmentForSlot(date, time);
      if (existingAppointment) return;
    }

    setEditingAppointment(null);
    setSelectedDate(date.toISOString().split("T")[0]);
    setSelectedTime(time);
    setFormData({
      doctorId: selectedDoctorId !== "all" ? selectedDoctorId : "",
      ...emptyAppointment,
    });
    setErrorMessage("");
    setIsFromCalendarSlot(true);
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
      setFormData(emptyAppointment);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const procedure = proceduresData.find(
      (procedure) => procedure._id === formData.procedureId
    );
    if (!procedure) return;

    const startTime = selectedTime;
    const startDateTime = new Date(`${selectedDate}T${startTime}:00`);
    const endDateTime = new Date(
      startDateTime.getTime() + procedure.duration * 60000
    );
    const endTime = endDateTime.toTimeString().slice(0, 5);

    // Check for overlaps with the same doctor (exclude current appointment if editing)
    if (
      onCheckOverlap(
        selectedDate,
        startTime,
        endTime,
        formData.doctorId,
        editingAppointment?.id
      )
    ) {
      setErrorMessage(
        "This time slot conflicts with an existing appointment for this doctor. Please select a different time."
      );
      return;
    }

    if (editingAppointment) {
      onUpdateAppointment(editingAppointment.id, {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        procedureId: formData.procedureId,
        date: selectedDate,
        startTime,
        endTime,
        notes: formData.notes,
        status: formData.status,
      });
      toast({
        title: "Appointment Updated",
        description: "The appointment has been successfully updated.",
      });
    } else {
      console.log({
        ...formData,
        date: new Date(selectedDate),
        startTime,
        endTime,
      });
      onAddAppointment({
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        procedureId: formData.procedureId,
        date: selectedDate,
        startTime,
        endTime,
        notes: formData.notes,
        status: formData.status,
      });
      toast({
        title: "Appointment Scheduled",
        description: "The appointment has been successfully scheduled.",
      });
    }

    setFormData(emptyAppointment);
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

  const weekDays = getWeekDays(currentWeek);
  const timeSlots = generateTimeSlots(
    slotsEndHour,
    slotsStartHour,
    clinicHours
  );
  const weekStart = getWeekStart(currentWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

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
      let latestHour = slotsEndHour ?? 23; // default fallback
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
          isTimeSlotAvailable(selectedDateObj, timeString, clinicHours)
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
    setFormData(emptyAppointment);
    setErrorMessage("");
    setIsFromCalendarSlot(false); // Mark as NOT coming from calendar slot
    setIsDialogOpen(true);
  };

  const generateSlotCountMapping = () => {
    const mergedAppointments = [];

    weekDays.forEach((day) => {
      const dateStr = day.toISOString().split("T")[0];
      const daySlots = new Map();

      timeSlots.forEach((slot, slotIndex) => {
        const { time } = slot;
        const slotWise = getAppointmentsForCombinedSlot(day, time);

        // Only process slots with exactly one appointment
        if (slotWise.length === 1) {
          const apptId = slotWise[0].id;

          if (daySlots.has(apptId)) {
            const existing = daySlots.get(apptId);

            // Check if this slot is consecutive to the last one
            if (slotIndex === existing.lastIndex + 1) {
              existing.count++;
              existing.lastIndex = slotIndex;
            } else {
              // Gap found - finalize previous sequence if count >= 2
              if (existing.count >= 2) {
                mergedAppointments.push({
                  apptId: apptId,
                  timeStart: existing.timeStart,
                  date: dateStr,
                  count: existing.count,
                });
              }

              // Start new sequence
              daySlots.set(apptId, {
                timeStart: time,
                count: 1,
                lastIndex: slotIndex,
              });
            }
          } else {
            // First occurrence of this appointment
            daySlots.set(apptId, {
              timeStart: time,
              count: 1,
              lastIndex: slotIndex,
            });
          }
        }
      });

      // Finalize any remaining sequences for this day
      daySlots.forEach((data, apptId) => {
        if (data.count >= 2) {
          mergedAppointments.push({
            apptId: apptId,
            timeStart: data.timeStart,
            date: dateStr,
            count: data.count,
          });
        }
      });
    });

    return mergedAppointments;
  };

  const isTimeWithinMergedAppt = (time, timeStart, count) => {
    const startHour = parseInt(timeStart.split(":")[0]);
    const startMinute = parseInt(timeStart.split(":")[1]);
    const slotIndexStart = startHour * 60 + startMinute;

    const currentHour = parseInt(time.split(":")[0]);
    const currentMinute = parseInt(time.split(":")[1]);
    const slotIndexCurrent = currentHour * 60 + currentMinute;

    const slotDiff = (slotIndexCurrent - slotIndexStart) / 15;

    return slotDiff >= 0 && slotDiff < count;
  };

  useEffect(() => {
    const merged = generateSlotCountMapping();
    setMergedAppointments(merged);
  }, [appointments]);

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
        <div className="flex gap-2 items-center">
          <div className="flex gap-2">
            <Select
              value={selectedDoctorId}
              onValueChange={setSelectedDoctorId}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {doctorsData.map((doctor) => (
                  <SelectItem key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

      <Card className="p-0 border-black overflow-hidden">
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
                  } last:border-b-0 h-[30px]`}
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
                        const isAvailable = isTimeSlotAvailable(
                          day,
                          time,
                          clinicHours
                        );
                        const isOpen = isDayOpen(day, clinicHours);

                        return (
                          <div
                            key={`${dayIndex}-${timeIndex}`}
                            className={`group ${
                              isAvailable ? "border-r" : ""
                            } last:border-r-0 relative h-[30px] ${
                              isOpen && isAvailable
                                ? "hover:bg-blue-100 cursor-pointer"
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
                            {selectedDoctorId === "all"
                              ? (() => {
                                  const appointmentsInThisSlot =
                                    getAppointmentsForCombinedSlot(day, time);
                                  if (appointmentsInThisSlot.length === 0)
                                    return null;
                                  const mergedAppt = mergedAppointments.find(
                                    (appt) =>
                                      appt.apptId ===
                                        appointmentsInThisSlot[0].id &&
                                      appt.timeStart === time &&
                                      appt.date ===
                                        day.toISOString().split("T")[0]
                                  );

                                  const isCoveredByMergedAppt =
                                    appointmentsInThisSlot.length === 1 &&
                                    mergedAppointments.some((appt) => {
                                      const slotDate = day
                                        .toISOString()
                                        .split("T")[0];

                                      // Check same appointment and date
                                      return (
                                        appt.apptId ===
                                          appointmentsInThisSlot[0].id &&
                                        appt.date === slotDate &&
                                        isTimeWithinMergedAppt(
                                          time,
                                          appt.timeStart,
                                          appt.count
                                        ) &&
                                        appt.timeStart !== time // ensure it's not the starting slot itself
                                      );
                                    });

                                  if (isCoveredByMergedAppt) {
                                    return null; // skip rendering this slot as it's covered by a merged block rendered above
                                  }

                                  return (
                                    appointmentsInThisSlot.length > 0 && (
                                      <div
                                        className={`absolute inset-x-1 rounded-md p-1 text-sm overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow flex items-center justify-center ${
                                          appointmentsInThisSlot.length === 1
                                            ? "text-white"
                                            : "text-black"
                                        }`}
                                        style={{
                                          backgroundColor: `${
                                            appointmentsInThisSlot.length === 1
                                              ? getAppointmentColor(
                                                  appointmentsInThisSlot[0],
                                                  proceduresData
                                                )
                                              : "#FFEBC6"
                                          }`,
                                          height:
                                            mergedAppt &&
                                            mergedAppt.timeStart === time &&
                                            mergedAppt.date ===
                                              day.toISOString().split("T")[0]
                                              ? `${30 * mergedAppt.count - 3}px`
                                              : `${30 - 3}px`,
                                          zIndex: 10,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          flexWrap: "wrap",
                                          gap: "2px",
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (
                                            appointmentsInThisSlot.length === 1
                                          ) {
                                            handleAppointmentClick(
                                              appointmentsInThisSlot[0]
                                            );
                                          } else {
                                            setOverlappingAppointmentsDialog({
                                              isOpen: true,
                                              appointments:
                                                appointmentsInThisSlot,
                                              timeSlot: time,
                                              date: day
                                                .toISOString()
                                                .split("T")[0],
                                            });
                                          }
                                        }}
                                      >
                                        {appointmentsInThisSlot.length === 1 ? (
                                          <div className="font-medium truncate">
                                            {
                                              patientsData.find(
                                                (p) =>
                                                  p._id ===
                                                  appointmentsInThisSlot[0]
                                                    .patientId
                                              )?.name
                                            }
                                          </div>
                                        ) : (
                                          <div className="font-medium">
                                            {appointmentsInThisSlot.length}{" "}
                                          </div>
                                        )}
                                        {appointmentsInThisSlot.map(
                                          (apt, idx) => (
                                            <div
                                              key={idx}
                                              className="w-3 h-3 rounded-full"
                                              style={{
                                                backgroundColor:
                                                  proceduresData.find(
                                                    (proc) =>
                                                      proc._id ===
                                                      apt.procedureId
                                                  ).color,
                                              }}
                                              title={`${
                                                patientsData.find(
                                                  (p) => p._id === apt.patientId
                                                )?.name
                                              } (${
                                                doctorsData.find(
                                                  (d) => d._id === apt.doctorId
                                                )?.name
                                              })`}
                                            />
                                          )
                                        )}
                                      </div>
                                    )
                                  );
                                })()
                              : (() => {
                                  const appointment =
                                    getSingleAppointmentForSlot(day, time);
                                  return (
                                    appointment &&
                                    isAppointmentStart(appointment, time) && (
                                      <div
                                        draggable
                                        onDragStart={(e) =>
                                          handleDragStart(e, appointment)
                                        }
                                        onDragEnd={handleDragEnd}
                                        className="absolute inset-x-1 rounded-md p-2 text-white text-xs overflow-hidden shadow-sm cursor-move hover:shadow-md transition-shadow"
                                        title={
                                          appointmentStatusConfig[appointment.status].label
                                        }
                                        style={{
                                          backgroundColor: proceduresData.find(
                                            (t) =>
                                              t._id === appointment.procedureId
                                          )?.color,
                                          height: `${
                                            getAppointmentHeight(appointment) *
                                              30 -
                                            3
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
                                            patientsData.find(
                                              (p) =>
                                                p._id === appointment.patientId
                                            )?.name
                                          }
                                        </div>
                                      </div>
                                    )
                                  );
                                })()}
                            {isOpen &&
                              isAvailable &&
                              !(selectedDoctorId !== "all"
                                ? getSingleAppointmentForSlot(day, time)
                                : false) && (
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

      <AppointmentForm
        dialogOptions={{ isDialogOpen, setIsDialogOpen }}
        popoverOptions={{ open, setOpen }}
        data={{
          patientsData,
          doctorsData,
          proceduresData,
          formData,
          timeOptions,
          setFormData,
        }}
        handleSubmit={handleSubmit}
        handleDelete={handleDelete}
        formDetails={{
          selectedDate,
          selectedTime,
          setSelectedDate,
          setSelectedTime,
          isFromCalendarSlot,
          setIsFromCalendarSlot,
          editingAppointment,
          setEditingAppointment,
          errorMessage,
          setErrorMessage,
        }}
      />
      <MergedAppointmentsDialog
        dialogOptions={{
          overlappingAppointmentsDialog,
          setOverlappingAppointmentsDialog,
        }}
        handleAppointmentClick={handleAppointmentClick}
        data={{ patientsData, proceduresData, doctorsData }}
      />
    </div>
  );
}
