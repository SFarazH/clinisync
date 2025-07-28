import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

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

export const appointmentStatusConfig = {
  scheduled: {
    label: "Scheduled",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
  missed: {
    label: "Missed",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: AlertCircle,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
};

  export const statusColors = {
    scheduled: "bg-[#DBEAFE] text-[#1E40AF]",
    completed: "bg-[#D1FAE5] text-[#065F46]",
    missed: "bg-[#FEF3C7] text-[#92400E]",
    cancelled: "bg-[#FEE2E2] text-[#991B1B]",
  };

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
