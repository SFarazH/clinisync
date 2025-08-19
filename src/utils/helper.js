import { format } from "date-fns";

export const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); //return monday
  d.setDate(diff);
  return d;
};

export const getWeekStartAndEnd = (currentWeek) => {
  const weekStart = getWeekStart(currentWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return { weekStart, weekEnd };
};

export const getWeekDays = (currentWeek) => {
  const weekStart = getWeekStart(currentWeek);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  return days;
};

export const isDayOpen = (date, clinicHours) => {
  if (!clinicHours) return false;
  const dayName = date
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  return clinicHours[dayName]?.isOpen && clinicHours[dayName].shifts.length > 0;
};

export const generateTimeSlots = (
  clinicEndHour,
  clinicStartHour,
  clinicHours
) => {
  const slots = [];

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

  for (let hour = clinicStartHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      const isMainSlot = minute === 0 || minute === 30;
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

export const isTimeSlotAvailable = (date, time, clinicHours) => {
  if (!clinicHours) return false;
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

export const getAppointmentHeight = (appointment) => {
  const startTime = new Date(`2000-01-01T${appointment.startTime}:00`);
  const endTime = new Date(`2000-01-01T${appointment.endTime}:00`);
  const durationMinutes =
    (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  return Math.max(1, durationMinutes / 15); // Each slot is now 15 minutes
};

export const getAppointmentColor = (appointment, proceduresData) => {
  return proceduresData.filter(
    (proc) => proc._id === appointment.procedureId
  )[0]?.color;
};

export const transformAppointmentData = (rawAppointments) => {
  return rawAppointments
    .filter((appt) => appt.status !== "cancelled")
    .map((appointment) => ({
      id: appointment._id,
      date: appointment.date.split("T")[0],
      patientId: appointment.patientId._id,
      doctorId: appointment.doctorId._id,
      procedureId: appointment.procedureId._id,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      notes: appointment.notes,
      status: appointment.status,
      patient: appointment.patientId,
      doctor: appointment.doctorId,
      procedure: appointment.procedureId,
    }));
};

export const checkAppointmentOverlap = (
  appointments,
  date,
  startTime,
  endTime,
  doctorId,
  excludeId
) => {
  return appointments
    .filter((appt) => appt.status !== "cancelled")
    .some((apt) => {
      // Handle both _id and id fields
      const appointmentId = apt._id || apt.id;
      if (excludeId && appointmentId === excludeId) {
        return false;
      }

      // Handle both date formats: "2025-07-21T00:00:00.000Z" and "2025-07-21"
      const appointmentDate = apt.date.includes("T")
        ? apt.date.split("T")[0]
        : apt.date;
      if (appointmentDate !== date) {
        return false;
      }

      // Handle nested doctor object: apt.doctorId._id vs apt.doctorId
      const appointmentDoctorId = apt.doctorId?._id || apt.doctorId;
      if (appointmentDoctorId !== doctorId) {
        return false;
      }

      // Create date objects for time comparison
      const aptStart = new Date(`${date}T${apt.startTime}:00`);
      const aptEnd = new Date(`${date}T${apt.endTime}:00`);
      const newStart = new Date(`${date}T${startTime}:00`);
      const newEnd = new Date(`${date}T${endTime}:00`);

      const hasOverlap = newStart < aptEnd && newEnd > aptStart;

      return hasOverlap;
    });
};

export const getSingleAppointmentForSlot = (
  appointmentsData,
  selectedDoctorId,
  date,
  time
) => {
  const dateString = format(date, "yyyy-MM-dd");

  const appointmentsToConsider =
    selectedDoctorId === "all"
      ? appointmentsData
      : appointmentsData.filter((apt) => apt.doctorId === selectedDoctorId);

  return appointmentsToConsider.find((apt) => {
    if (apt.date !== dateString) return false;
    const aptStart = new Date(`2000-01-01T${apt.startTime}:00`);
    const aptEnd = new Date(`2000-01-01T${apt.endTime}:00`);
    const slotTimeObj = new Date(`2000-01-01T${time}:00`);
    return slotTimeObj >= aptStart && slotTimeObj < aptEnd;
  });
};

export const isAppointmentStart = (appointment, time) => {
  return appointment.startTime === time;
};

export const getAppointmentsForCombinedSlot = (
  appointmentsData,
  date,
  slotTime
) => {
  const dateString = format(date, "yyyy-MM-dd");
  const currentSlotStart = new Date(`2000-01-01T${slotTime}:00`);
  const currentSlotEnd = new Date(currentSlotStart.getTime() + 15 * 60000);

  return appointmentsData.filter((apt) => {
    if (apt.date !== dateString) return false;
    const aptStart = new Date(`2000-01-01T${apt.startTime}:00`);
    const aptEnd = new Date(`2000-01-01T${apt.endTime}:00`);

    // Check for overlap: (startA < endB) && (endA > startB)
    return aptStart < currentSlotEnd && aptEnd > currentSlotStart;
  });
};

export const isTimeWithinMergedAppt = (time, timeStart, count) => {
  const startHour = parseInt(timeStart.split(":")[0]);
  const startMinute = parseInt(timeStart.split(":")[1]);
  const slotIndexStart = startHour * 60 + startMinute;

  const currentHour = parseInt(time.split(":")[0]);
  const currentMinute = parseInt(time.split(":")[1]);
  const slotIndexCurrent = currentHour * 60 + currentMinute;

  const slotDiff = (slotIndexCurrent - slotIndexStart) / 15;

  return slotDiff >= 0 && slotDiff < count;
};

export const formatDOB = (dob) => {
  const dateObj = new Date(dob);
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = dateObj.getFullYear();
  return `${day}-${month}-${year}`;
};

export const displayName = (user) => {
  if (!user) return;
  switch (user.role) {
    case "admin":
      return "Admin";
    case "doctor":
      return "Doctor";
    case "receptionist":
      return "receptionist";
    case "pharmacist":
      return "Pharmacist";

    default:
      break;
  }
};
