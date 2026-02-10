import WhatsappMessage from "@/models/WhatsappMessage";
import { getMongooseModel } from "@/utils/dbConnect";
import { twilio } from "twilio";

export async function sendWhatsappMessage(data) {
  const WhatsappMessagesModel = await getMongooseModel(
    "clinisync",
    "WhatsappMessage",
    WhatsappMessage.schema,
  );

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  const client = twilio(accountSid, authToken);
  const from = process.env.TWILIO_WHATSAPP_NUMBER;

  const { clinic, to, patientName, doctorName, apptDate, apptTime } = data;

  let contentSid = TWILIO_MSG_SID;
  if (clinic.hasLocation) contentSid = process.env.TWILIO_LOCATION_MSG_SID;

  const messageBody = {
    1: patientName,
    2: doctorName,
    3: apptDate,
    4: apptTime,
    5: clinic.name,
    6: clinic.phone,
  };
  if (clinic.hasLocation) messageBody["7"] = clinic.mapsLocation;
  try {
    const message = await client.messages.create({
      from: `whatsapp:+${from}`,
      to: `whatsapp:+91${to}`,
      contentSid: contentSid,
      contentVariables: JSON.stringify(messageBody),
      statusCallback: "https://b636d358e7d6.ngrok-free.app/twilio/status",
    });

    const outgoingWhatsappMessage = {
      messageSid: message.sid,
      accountSid: message.accountSid,

      body: message.body,
      from: message.from,
      to: message.to,

      messageType: "text",
      direction: message.direction,
      status: message.status,

      numMedia: message.numMedia || "0",
      mediaUrl: null,

      errorCode: message.errorCode,
      errorMessage: message.errorMessage,

      dateCreated: message.dateCreated,

      // clinic: clinicId || null,
      // patientId: patientId || null,
      // appointmentId: appointmentId || null,

      rawPayload: message,
    };

    await WhatsappMessagesModel.create(outgoingWhatsappMessage);

    return { success: true, message: "Whatsapp message sent" };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: error.message };
  }
}

export async function handleIncomingMessage(data) {
  if (!data?.AccountSid || !data?.MessageSid) return;

  const WhatsappMessagesModel = await getMongooseModel(
    "clinisync",
    "WhatsappMessage",
    WhatsappMessage.schema,
  );

  const exists = await WhatsappMessagesModel.findOne({
    messageSid: data.MessageSid,
  });
  if (exists) return;

  const incomingWhatsappMessage = {
    messageSid: data.MessageSid,
    accountSid: data.AccountSid,
    body: data.Body,
    from: data.From,
    to: data.To,
    messageType: data.MessageType,
    direction: "inbound",
    status: data.SmsStatus,
    profileName: data.ProfileName,
    waId: data.WaId,
    numMedia: Number(data.NumMedia || 0),
    mediaUrl: data.NumMedia > 0 ? data.MediaUrl0 : null,
    rawPayload: data,
  };
  await WhatsappMessagesModel.create(incomingWhatsappMessage);
}

export async function handleStatusWebhook(data) {
  const WhatsappMessagesModel = await getMongooseModel(
    "clinisync",
    "WhatsappMessage",
    WhatsappMessage.schema,
  );

  if (!data?.AccountSid || !data?.MessageSid) return;

  const existingMessage = await WhatsappMessagesModel.findOne({
    messageSid: data.MessageSid,
  });

  existingMessage.status = data.SmsStatus;
  await existingMessage.save();
}
