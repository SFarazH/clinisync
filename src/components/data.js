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
  cost: 0,
};

export const emptyDoctor = {
  name: "",
  specialization: "",
  email: "",
  phoneNumber: "",
  color: "#3b82f6",
};

export const emptyAppointment = {
  patientId: "",
  doctorId: "",
  procedureId: "",
  notes: "",
  status: "scheduled",
};

export const emptyPrescription = {
  medications: [],
  generalNotes: "",
  appointment: "",
  patient: "",
};

export const emptyMedicineDetails = {
  medicineName: "",
  shortComposition1: "",
  shortComposition2: "",
};

export const emptyMedicationItem = {
  medicine: emptyMedicineDetails,
  frequency: "",
  duration: "",
  instructions: "",
};

export const emptyUser = {
  name: "",
  email: "",
  role: "receptionist",
  phoneNumber: "",
  gender: "",
  dob: "",
  address: "",
  doctorId: null,
};

export const emptyLabWork = {
  nameOfLab: "",
  patientId: "",
  work: "",
  isReceived: false,
  dateSubmitted: Date.now(),
  dateExpected: "",
  amount: 0,
};

export const emptyClinic = {
  name: "",
  clinicName: "",
  admin: null,
  databaseName: "",
  plan: "basic",
  features: {
    calendar: true,
    patients: true,
    doctors: true,
    procedures: true,
    appointments: true,
    prescriptions: true,
    settings: true,
    "lab-work": false,
    users: true,
    invoices: true,
    attachments: false,
    "whatsapp-reminders": false,
  },
  isClinicActive: true,
  phone: "",
  email: "",
  googleMapsLink: "",
  latitude: "",
  longitude: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  whatsappTemplate: "",
  whatsappMsgFrequency: {
    onBooking: false,
    onAppointmentDay: false,
  },
  isTrialActive: false,
};

export const defaultClinicSettings = {
  timezone: "Asia/Kolkata",
  openingHours: {
    monday: {
      isOpen: true,
      shifts: [
        { start: "09:00", end: "13:00" },
        { start: "17:00", end: "20:00" },
      ],
      breaks: [{ start: "13:00", end: "17:00" }],
    },
    tuesday: {
      isOpen: true,
      shifts: [
        { start: "09:00", end: "13:00" },
        { start: "17:00", end: "20:00" },
      ],
      breaks: [{ start: "13:00", end: "17:00" }],
    },
    wednesday: {
      isOpen: true,
      shifts: [
        { start: "09:00", end: "13:00" },
        { start: "17:00", end: "20:00" },
      ],
      breaks: [{ start: "13:00", end: "17:00" }],
    },
    thursday: {
      isOpen: true,
      shifts: [
        { start: "09:00", end: "13:00" },
        { start: "17:00", end: "20:00" },
      ],
      breaks: [{ start: "13:00", end: "17:00" }],
    },
    friday: {
      isOpen: true,
      shifts: [
        { start: "09:00", end: "13:00" },
        { start: "17:00", end: "20:00" },
      ],
      breaks: [{ start: "13:00", end: "17:00" }],
    },
    saturday: {
      isOpen: true,
      shifts: [{ start: "09:00", end: "14:00" }],
      breaks: [],
    },
    sunday: {
      isOpen: false,
      shifts: [],
      breaks: [],
    },
  },
};

export const whatsappTemplates = [
  {
    key: "clinisync_appointment_location",
    title: "Message with Location",
    description: "Appointment Reminder with Location tag",
    image: "/whatsapp/wa_loc.jpeg",
    warning: "Enter latitude and longitude in Edit Clinic",
  },
  {
    key: "clinisync_appointment_gmap",
    title: "Message with Map Link",
    description: "Appointment Reminder with Google map link",
    image: "/whatsapp/wa_gmap.jpeg",
    warning: "Enter Google Maps Link in Edit Clinic",
  },
  {
    key: "clinisync_appointment",
    title: "Normal Reminder Message",
    description: "Basic Appointment Reminder",
    image: "/whatsapp/wa.jpeg",
  },
];
