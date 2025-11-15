export const roles = {
  ADMIN: "admin",
  RECEPTIONIST: "receptionist",
  PHARMACIST: "pharmacist",
  DOCTOR: "doctor",
  SUPER_ADMIN: "super-admin",
};

export const rolePermissions = {
  appSettings: {
    getSettings: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST],
    createOrUpdateSettings: [roles.ADMIN],
  },
  appointments: {
    createAppointment: [roles.ADMIN, roles.RECEPTIONIST, roles.DOCTOR],
    listAppointments: [roles.ADMIN, roles.RECEPTIONIST, roles.DOCTOR],
    getAppointmentById: [roles.ADMIN, roles.RECEPTIONIST, roles.DOCTOR],
    updateAppointment: [roles.ADMIN, roles.RECEPTIONIST, roles.DOCTOR],
    deleteAppointment: [roles.ADMIN, roles.RECEPTIONIST, roles.DOCTOR],
  },
  doctors: {
    getAllDoctors: [roles.RECEPTIONIST, roles.ADMIN, roles.DOCTOR],
    addDoctor: [roles.ADMIN],
    getDoctorById: [roles.RECEPTIONIST, roles.ADMIN, roles.DOCTOR],
    updateDoctor: [roles.RECEPTIONIST, roles.ADMIN, roles.DOCTOR],
    deleteDoctor: [roles.RECEPTIONIST, roles.ADMIN, roles.DOCTOR],
  },
  invocie: {
    getInvocies: [roles.RECEPTIONIST, roles.ADMIN, roles.DOCTOR],
    addPaymentForInvoice: [roles.RECEPTIONIST, roles.ADMIN, roles.DOCTOR],
    getInvoiceById: [roles.RECEPTIONIST, roles.ADMIN, roles.DOCTOR],
  },
  labWork: {
    addLabWork: [roles.ADMIN, roles.DOCTOR],
    getAllLabWorks: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST],
    updateLabWork: [roles.ADMIN, roles.DOCTOR],
    markLabWorkComplete: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST],
    deleteLabWork: [roles.ADMIN, roles.DOCTOR],
  },
  medicines: {
    getMedicines: [roles.ADMIN, roles.DOCTOR],
  },
  patients: {
    searchPatients: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST],
    listPatients: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST],
    createPatient: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST],
    getPaginatedPatients: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST],
    getPatientById: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST],
    updatePatient: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST],
    deletePatient: [roles.ADMIN, roles.DOCTOR],
  },
  prescriptions: {
    addPrescription: [roles.ADMIN, roles.DOCTOR],
    getPrescriptions: [
      roles.ADMIN,
      roles.DOCTOR,
      roles.PHARMACIST,
      roles.RECEPTIONIST,
    ],
    updatePrescription: [roles.ADMIN, roles.DOCTOR],
  },
  procedures: {
    createProcedure: [roles.ADMIN, roles.DOCTOR],
    getProcedures: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST],
    getProcedureById: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST],
    updateProcedure: [roles.ADMIN, roles.DOCTOR],
    deleteProcedure: [roles.ADMIN, roles.DOCTOR],
  },
  s3: {
    s3Upload: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST],
    getS3Image: [roles.ADMIN, roles.DOCTOR, roles.RECEPTIONIST],
  },
  users: {
    getUsersCount: [roles.ADMIN],
    listUsers: [roles.ADMIN],
  },
};
