export const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); //return monday
  d.setDate(diff);
  return d;
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
  )[0].color;
};
