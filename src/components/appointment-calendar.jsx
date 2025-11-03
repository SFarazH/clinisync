"use client";
import React, { useEffect, useMemo } from "react";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addAppointment,
  deleteAppointment,
  fetchAppointments,
  fetchDoctors,
  listPatients,
  fetchProceudres,
  updateAppointment,
  getClinicConfig,
} from "@/lib";
import { emptyAppointment } from "./data";
import {
  checkAppointmentOverlap,
  getAppointmentsForCombinedSlot,
  getSingleAppointmentForSlot,
  transformAppointmentData,
  generateTimeSlots,
  getWeekDays,
  getWeekStartAndEnd,
  isDayOpen,
  isTimeSlotAvailable,
} from "../utils/helper";
import AppointmentForm from "./forms/appointment.form";
import MergedAppointmentsDialog from "./forms/merged-appointments";
import CalendarView from "./forms/calendar-view";
import Loader from "./loader";
import { useAuth } from "@/components/context/authcontext";
import { format } from "date-fns";

export default function AppointmentCalendar() {
  const queryClient = useQueryClient();
  const { authUser } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState("all");
  const [formData, setFormData] = useState(emptyAppointment);
  const [attachments, setAttachments] = useState([]);
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
  const [open, setOpen] = useState(false);
  const [clinicHours, setClinicHours] = useState({});

  const slotsStartHour = 9;
  const slotsEndHour = 23;

  const { weekStart, weekEnd } = useMemo(
    () => getWeekStartAndEnd(currentWeek),
    [currentWeek]
  );

  const queryParams = useMemo(
    () => ({
      startDate: format(weekStart, "yyyy-MM-dd"),
      endDate: format(weekEnd, "yyyy-MM-dd"),
      doctorId: selectedDoctorId === "all" ? undefined : selectedDoctorId,
      isPaginate: false,
    }),
    [weekStart, weekEnd, selectedDoctorId]
  );

  const { data: patientsData = [], isLoading: loadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: listPatients,
  });

  const { data: doctorsData = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: fetchDoctors,
  });

  const { data: proceduresData = [], isLoading: loadingProcedures } = useQuery({
    queryKey: ["procedures"],
    queryFn: fetchProceudres,
  });

  const { data: rawAppointmentsData = [], isLoading: loadingAppointments } =
    useQuery({
      queryKey: ["appointments", queryParams],
      queryFn: () => {
        return fetchAppointments(queryParams);
      },
      enabled:
        !!queryParams && !!queryParams.startDate && !!queryParams.endDate,
    });

  const { data: clinicSettings = {}, isLoading: loadingSettings } = useQuery({
    queryKey: ["clinicSettings"],
    queryFn: () => getClinicConfig(),
  });

  const addAppointmentMutation = useMutation({
    mutationFn: addAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
    },
  });

  useEffect(() => {
    if (authUser.role === "doctor") {
      setSelectedDoctorId(
        doctorsData?.filter((doc) => doc.email === authUser.email)[0]?._id
      );
    }
  }, [authUser, doctorsData]);

  const updateAppointmentMutation = useMutation({
    mutationFn: updateAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
      setEditingAppointment(null);
      setIsDialogOpen(false);
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
      setIsDialogOpen(false);
      setEditingAppointment(null);
    },
  });

  const appointmentsData = useMemo(
    () => transformAppointmentData(rawAppointmentsData),
    [rawAppointmentsData]
  );

  useEffect(() => {
    if (clinicSettings) {
      setClinicHours(clinicSettings.openingHours);
    }
  }, [clinicSettings, loadingSettings]);

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

    const dateString = format(date, "yyyy-MM-dd");
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

    const dateString = format(date, "yyyy-MM-dd");
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
      checkAppointmentOverlap(
        appointmentsData,
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

    updateAppointmentMutation.mutateAsync({
      id: draggedAppointment.id,
      appointmentData: {
        ...draggedAppointment,
        date: dateString,
        startTime: time,
        endTime: newEndTime,
      },
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
    setAttachments(appointment.attachments);
    setErrorMessage(""); // Clear error message
    setIsFromCalendarSlot(false); // Mark as NOT coming from calendar slot
    setIsDialogOpen(true);
  };

  const handleTimeSlotClick = (date, time) => {
    if (
      !isDayOpen(date, clinicHours) ||
      !isTimeSlotAvailable(date, time, clinicHours)
    )
      return;
    if (selectedDoctorId !== "all") {
      const existingAppointment = getSingleAppointmentForSlot(
        appointmentsData,
        selectedDoctorId,
        date,
        time
      );
      if (existingAppointment) return;
    }
    setFormData({
      ...emptyAppointment,
      doctorId: selectedDoctorId !== "all" ? selectedDoctorId : "",
    });

    setEditingAppointment(null);
    setSelectedDate(format(date, "yyyy-MM-dd"));
    setSelectedTime(time);
    setErrorMessage("");
    setIsFromCalendarSlot(true);
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (editingAppointment) {
      deleteAppointmentMutation.mutateAsync(editingAppointment.id);
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
      checkAppointmentOverlap(
        appointmentsData,
        selectedDate,
        startTime,
        endTime,
        formData.doctorId,
        editingAppointment?._id || editingAppointment?.id
      )
    ) {
      setErrorMessage(
        "This time slot conflicts with an existing appointment for this doctor. Please select a different time."
      );
      return;
    }

    if (editingAppointment) {
      updateAppointmentMutation.mutateAsync({
        id: editingAppointment.id,
        appointmentData: {
          ...formData,
          date: new Date(selectedDate),
          startTime,
          endTime,
        },
      });
    } else {
      addAppointmentMutation.mutateAsync({
        ...formData,
        date: new Date(selectedDate),
        startTime,
        endTime,
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
    !!clinicHours
  );

  const generateTimeOptions = (date) => {
    if (!date) return [];

    const selectedDateObj = new Date(date);
    const dayName = selectedDateObj
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const dayHours = clinicHours[dayName];

    if (
      !dayHours?.isOpen ||
      !Array.isArray(dayHours.shifts) ||
      dayHours.shifts.length === 0
    ) {
      return [];
    }

    const options = [];

    // iterate through all shifts
    for (const shift of dayHours.shifts) {
      const [startHour, startMinute] = shift.start.split(":").map(Number);
      const [endHour, endMinute] = shift.end.split(":").map(Number);

      // convert start & end times into minutes from midnight
      const startInMinutes = startHour * 60 + startMinute;
      const endInMinutes = endHour * 60 + endMinute;

      for (let mins = startInMinutes; mins < endInMinutes; mins += 15) {
        const hour = Math.floor(mins / 60);
        const minute = mins % 60;
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

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
    setIsFromCalendarSlot(false);
    setIsDialogOpen(true);
  };

  const generateSlotCountMapping = () => {
    const mergedAppointments = [];

    weekDays.forEach((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const daySlots = new Map();

      timeSlots.forEach((slot, slotIndex) => {
        const { time } = slot;
        const slotWise = getAppointmentsForCombinedSlot(
          appointmentsData,
          day,
          time
        );

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

  const mergedAppointments = useMemo(() => {
    return generateSlotCountMapping();
  }, [appointmentsData]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Appointment Calendar</CardTitle>
          <CardDescription>
            View and schedule appointments. Click on a time slot to create a new
            appointment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {weekStart.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                -{" "}
                {weekEnd.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "2-digit",
                })}
              </h2>
              <div className="flex gap-2 items-center">
                <div className="flex gap-2">
                  <Select
                    value={selectedDoctorId}
                    onValueChange={(value) => setSelectedDoctorId(value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Doctors</SelectItem>
                      {loadingDoctors ? (
                        <SelectItem disabled>
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            <span>Loading...</span>
                          </div>
                        </SelectItem>
                      ) : (
                        doctorsData.map((doctor) => (
                          <SelectItem key={doctor._id} value={doctor._id}>
                            {doctor.name}
                          </SelectItem>
                        ))
                      )}
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

                <CalendarView
                  data={{
                    patientsData,
                    doctorsData,
                    appointmentsData,
                    proceduresData,
                    loadingPatients,
                  }}
                  timeSlotOptions={{
                    isTimeSlotAvailable,
                    handleTimeSlotClick,
                    handleAppointmentClick,
                  }}
                  calendarData={{
                    timeSlots,
                    weekDays,
                    clinicHours,
                    selectedDoctorId,
                    mergedAppointments,
                  }}
                  dragOptions={{
                    handleDragOver,
                    handleDragLeave,
                    handleDrop,
                    handleDragEnd,
                    handleDragStart,
                    dragOverSlot,
                  }}
                  loaders={{
                    addAppointmentLoading: addAppointmentMutation.isPending,
                    updateAppointmentLoading:
                      updateAppointmentMutation.isPending,
                    deleteAppointmentLoading:
                      deleteAppointmentMutation.isPending,
                  }}
                  setOverlappingAppointmentsDialog={
                    setOverlappingAppointmentsDialog
                  }
                />
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
                selectedDoctorId,
                attachments,
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
              loaders={{
                loadingPatients,
                loadingDoctors,
                loadingProcedures,
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
        </CardContent>
      </Card>
      {loadingSettings && <Loader />}
    </>
  );
}
