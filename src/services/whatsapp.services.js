import Appointment from "@/models/Appointment";
import Clinic from "@/models/Clinic";
import Patient from "@/models/Patient";
import WhatsappMessage from "@/models/WhatsappMessage";
import { checkAccess } from "@/utils";
import { getMongooseModel } from "@/utils/dbConnect";
import { FeatureMapping } from "@/utils/feature.mapping";
import axios from "axios";

export async function getWhatsappMessagesByClinic(dbName) {
  const whatsappMessageModel = await getMongooseModel(
    "clinisync",
    "WhatsappMessages",
    WhatsappMessage.schema,
  );
  const patientModel = await getMongooseModel(
    dbName,
    "Patient",
    Patient.schema,
  );
  const appointmentModel = await getMongooseModel(
    dbName,
    "Appointment",
    Appointment.schema,
  );

  const clinicsModel = await getMongooseModel(
    "clinisync",
    "Clinics",
    Clinic.schema,
  );

  const clinicDoc = await clinicsModel.findOne({ databaseName: dbName });
  if (!clinicDoc) return { success: false, error: "Clinic not found" };

  try {
    const messages = await whatsappMessageModel
      .find({
        direction: "outgoing",
        $or: [{ clinicId: clinicDoc._id }, { clinicDbName: dbName }],
      })
      .select({
        messageId: 1,
        to: 1,
        waId: 1,
        appointmentId: 1,
        patientId: 1,
        status: 1,
        pricing: 1,
        error: 1,
        createdAt: 1,
      })
      .populate({
        path: "patientId",
        model: patientModel,
        select: "name",
      })
      .populate({
        path: "appointmentId",
        model: appointmentModel,
        select: "date startTime",
      })
      .sort({ createdAt: -1 });

    // console.log(messages, "mesages");

    return { success: true, data: messages };
  } catch (error) {
    console.error("Error fetching WhatsApp messages for clinic:", error);
    return { success: false, error: error.message };
  }
}

// --------------- SEND MESSAGE ----------------------------

export function validateWhatsAppPayload(data) {
  const {
    to,
    msgKey,
    patientName,
    doctorName,
    date,
    time,
    clinicName,
    clinicPhone,
    latitude,
    longitude,
    address,
    gmapLink,
  } = data;

  const errors = [];

  // ---------- 1. CLINIC VALIDATION ----------
  if (!clinicName) {
    errors.push("Missing clinic name");
  }

  if (!clinicPhone) {
    errors.push("Missing clinic phone");
  }

  // ---------- 2. PATIENT VALIDATION ----------
  if (!patientName) {
    errors.push("Missing patient name");
  }

  if (!to) {
    errors.push("Missing patient phone number");
  }

  // ---------- 3. COMMON MESSAGE FIELDS ----------
  if (!doctorName) {
    errors.push("Missing doctor name");
  }

  if (!date) {
    errors.push("Missing appointment date");
  }

  if (!time) {
    errors.push("Missing appointment time");
  }

  if (!msgKey) {
    errors.push("Missing template key");
  }

  // ---------- 4. TEMPLATE-SPECIFIC VALIDATION ----------

  // 📍 Location template
  if (msgKey === "clinisync_appointment_location") {
    if (latitude == null || longitude == null) {
      errors.push("Latitude and Longitude required for location template");
    }

    if (!address) {
      errors.push("Address required for location template");
    }
  }

  if (msgKey === "clinisync_appointment_gmap") {
    if (!gmapLink) {
      errors.push("Google Maps link required for gmap template");
    }
  }

  // ---------- 5. SUCCESS ----------
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

function buildWhatsAppPayload({
  to,
  msgKey,
  patientName,
  doctorName,
  date,
  time,
  clinicName,
  clinicPhone,
  latitude,
  longitude,
  address,
  gmapLink,
}) {
  const basePayload = {
    messaging_product: "whatsapp",
    to: `91${to}`,
    type: "template",
    template: {
      name: msgKey,
      language: { code: "en" },
      components: [],
    },
  };

  const bodyParams = [
    { type: "text", text: patientName },
    { type: "text", text: doctorName },
    { type: "text", text: date },
    { type: "text", text: time },
    { type: "text", text: clinicName },
    { type: "text", text: clinicPhone },
  ];

  // Case 1: Location template
  if (msgKey === "clinisync_appointment_location" && latitude && longitude) {
    basePayload.template.components.push({
      type: "header",
      parameters: [
        {
          type: "location",
          location: {
            latitude,
            longitude,
            name: clinicName,
            address,
          },
        },
      ],
    });

    basePayload.template.components.push({
      type: "body",
      parameters: bodyParams,
    });

    return basePayload;
  }

  // Case 2: Google Maps link
  if (msgKey === "clinisync_appointment_gmap" && gmapLink) {
    basePayload.template.components.push({
      type: "body",
      parameters: [...bodyParams, { type: "text", text: gmapLink }],
    });

    return basePayload;
  }

  // Case 3: Default
  basePayload.template.components.push({
    type: "body",
    parameters: bodyParams,
  });

  return basePayload;
}

export async function sendWhatsappMessage({ payload, dbName, data }) {
  const url = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

  const whatsappMessageModel = await getMongooseModel(
    "clinisync",
    "WhatsappMessages",
    WhatsappMessage.schema,
  );

  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
    "Content-Type": "application/json",
  };

  try {
    const res = await axios.post(url, payload, { headers: headers });
    const responseData = res.data;

    const messageDoc = {
      messageId: responseData.messages[0].id,

      from: process.env.WHATSAPP_PHONE,
      to: responseData.contacts[0].input,
      waId: responseData.contacts[0].wa_id,

      direction: "outgoing",

      template: data.template.name,
      status: responseData.messages[0].message_status,

      clinicId: data.clinicId,
      clinicDbName: dbName,
      patientId: data.patientId,
      appointmentId: data.appointmentId,

      rawPayload: payload,
    };

    const whatsappDoc = await whatsappMessageModel.create(messageDoc);

    return { success: true, data: whatsappDoc };
  } catch (error) {
    console.dir(error.response.data, { depth: null });
    return { success: false, data: error };
  }
}

export async function sendAppointmentReminder({
  appointment,
  clinic,
  isCron,
  dbName,
}) {
  const accessError = checkAccess(
    clinic,
    dbName,
    FeatureMapping.WHATSAPP_REMINDERS,
  );
  if (accessError) {
    return {
      success: false,
      error: "Whatsapp messaging not enabled",
    };
  }

  if (isCron) {
    if (!clinic.whatsappMsgFrequency.onAppointmentDay) {
      return {
        success: false,
        error: "Message on appointment day not enabled",
      };
    }
  } else {
    if (!clinic.whatsappMsgFrequency.onBooking) {
      return {
        success: false,
        error: "Message on appointment booking not enabled",
      };
    }
  }

  const payloadData = {
    to: appointment.patient?.phone,
    msgKey: clinic.whatsappTemplate,
    patientName: appointment.patient?.name,
    doctorName: appointment.doctor?.name,
    date: appointment.formattedDateShort,
    time: appointment.formattedTime,
    clinicName: clinic.name,
    clinicPhone: clinic.phone,
    latitude: clinic?.latitude,
    longitude: clinic?.longitude,
    address: `${clinic.addressLine1}, ${clinic.city}`,
    gmapLink: clinic?.googleMapsLink,
  };

  try {
    const validation = validateWhatsAppPayload(payloadData);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(", ") };
    }

    const payload = buildWhatsAppPayload(payloadData);

    const result = await sendWhatsappMessage({
      payload: payload,
      data: {
        template: {
          name: clinic.whatsappTemplate,
        },
        clinicId: clinic._id,
        patientId: appointment.patient?._id,
        appointmentId: appointment?._id,
      },
      dbName: clinic.databaseName,
    });

    if (!result.success) {
      return {
        success: false,
        error:
          result?.data?.response?.data?.error?.message ||
          result?.data?.message ||
          "WhatsApp API error",
      };
    }

    const appointmentModel = await getMongooseModel(
      clinic.databaseName,
      "Appointment",
      Appointment.schema,
    );

    await appointmentModel.findByIdAndUpdate(appointment._id, {
      $set: {
        [isCron ? "remindersSent.onAppointmentDay" : "remindersSent.onBooking"]:
          true,
      },
    });

    return {
      success: true,
      data: result.data,
      message: "Whatsapp message sent",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message ?? "Error",
    };
  }
}
