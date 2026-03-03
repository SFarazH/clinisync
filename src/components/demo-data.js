export const dummyPatients = [
  {
    _id: "p1",
    name: "Jim Halpert",
    email: "jim.halpert@dundermifflin.com",
    phone: "9876500001",
    age: 34,
    gender: "male",
    dob: "1990-03-05",
    address: "Scranton, Pennsylvania",
  },
  {
    _id: "p2",
    name: "Dwight Schrute",
    email: "dwight.schrute@dundermifflin.com",
    phone: "9876500002",
    age: 38,
    gender: "male",
    dob: "1986-01-20",
    address: "Schrute Farms, Pennsylvania",
  },
  {
    _id: "p3",
    name: "Pam Beesly",
    email: "pam.beesly@dundermifflin.com",
    phone: "9876500003",
    age: 33,
    gender: "female",
    dob: "1991-03-25",
    address: "Scranton, Pennsylvania",
  },
  {
    _id: "p4",
    name: "Angela Martin",
    email: "angela.martin@dundermifflin.com",
    phone: "9876500004",
    age: 36,
    gender: "female",
    dob: "1988-11-11",
    address: "Scranton, Pennsylvania",
  },
];

export const dummyProcedures = [
  {
    _id: "pr1",
    name: "General Consultation",
    duration: 30,
    abbr: "GC",
    color: "#3b82f6",
    cost: 500,
  },
  {
    _id: "pr2",
    name: "Dental Cleaning",
    duration: 45,
    abbr: "DC",
    color: "#10b981",
    cost: 1200,
  },
  {
    _id: "pr3",
    name: "Root Canal Treatment",
    duration: 90,
    abbr: "RCT",
    color: "#f59e0b",
    cost: 4500,
  },
  {
    _id: "pr4",
    name: "Tooth Extraction",
    duration: 45,
    abbr: "EXT",
    color: "#ef4444",
    cost: 1500,
  },
];

export const dummyDoctors = [
  {
    _id: "d1",
    name: "Michael Scott",
    specialization: "General Dentist",
    email: "bestboss@demo.com",
    phoneNumber: "9876543210",
    color: "#3b82f6",
  },
  {
    _id: "d2",
    name: "David Wallace",
    specialization: "Endodontist",
    email: "david.wallace@demo.com",
    phoneNumber: "9123456780",
    color: "#10b981",
  },
];

export const dummyClinicHours = {
  monday: {
    isOpen: true,
    shifts: [
      {
        start: "09:00",
        end: "17:00",
      },
    ],
    breaks: [
      {
        start: "12:00",
        end: "13:00",
      },
    ],
  },
  tuesday: {
    isOpen: true,
    shifts: [
      {
        start: "09:00",
        end: "17:00",
      },
    ],
    breaks: [
      {
        start: "12:00",
        end: "13:00",
      },
    ],
  },
  wednesday: {
    isOpen: true,
    shifts: [
      {
        start: "09:00",
        end: "17:00",
      },
    ],
    breaks: [
      {
        start: "12:00",
        end: "13:00",
      },
    ],
  },
  thursday: {
    isOpen: true,
    shifts: [
      {
        start: "09:00",
        end: "17:00",
      },
    ],
    breaks: [
      {
        start: "12:00",
        end: "13:00",
      },
    ],
  },
  friday: {
    isOpen: true,
    shifts: [
      {
        start: "09:00",
        end: "17:00",
      },
    ],
    breaks: [
      {
        start: "12:00",
        end: "13:00",
      },
    ],
  },
  saturday: {
    isOpen: true,
    shifts: [
      {
        start: "09:00",
        end: "17:00",
      },
    ],
    breaks: [
      {
        start: "12:00",
        end: "13:00",
      },
    ],
  },
  sunday: {
    isOpen: false,
    shifts: [],
    breaks: [],
  },
};
