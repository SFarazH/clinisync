export const procedureColorOptions = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

export const doctorColorOptions = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

export const daysOfWeek = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export const emptyPatient = {
  name: "",
  email: "",
  phone: "",
  age: 0,
  gender: "",
  dob: "",
  address: "",
};

export const emptyProcedure = {
  name: "",
  duration: 30,
  abbr: "",
  color: "#3b82f6",
};

export const emptyDoctor = {
  name: "",
  specialization: "",
  email: "",
  phone: "",
  color: "#3b82f6",
};

export const emptyAppointment = {
  patientId: "",
  doctorId: "",
  procedureId: "",
  notes: "",
  status: "scheduled",
};
