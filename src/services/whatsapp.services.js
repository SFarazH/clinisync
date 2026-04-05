import WhatsappMessage from "@/models/WhatsappMessage";
import { getMongooseModel } from "@/utils/dbConnect";
import axios from "axios";

function buildWhatsAppContent(msg) {
  const type = msg.type;

  switch (type) {
    case "text":
      return {
        text: msg.text?.body,
      };

    case "image":
      return { image: msg.image };
    case "sticker":
      return { sticker: msg.sticker };
    case "video":
      return { video: msg.video };
    case "audio":
      return { audio: msg.audio };
    case "document":
      return { document: msg.document };
    case "reaction":
      return {
        reaction: msg.reaction,
      };

    case "button":
      return {
        payload: msg.button?.payload,
        text: msg.button?.text,
      };

    case "interactive":
      return {
        payload:
          msg.interactive?.button_reply?.id || msg.interactive?.list_reply?.id,

        title:
          msg.interactive?.button_reply?.title ||
          msg.interactive?.list_reply?.title,
      };

    case "location":
      return {
        latitude: msg.location?.latitude,
        longitude: msg.location?.longitude,
        name: msg.location?.name,
        address: msg.location?.address,
      };

    case "contacts":
      return {
        contacts: msg.contacts,
      };

    default:
      console.warn("Unhandled message type:", type);
      return {};
  }
}

export async function sendWhatsappMessage(data) {
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

  const requestBody = {
    messaging_product: "whatsapp",
    to: `91${data.patientPhone}`,
    type: "template",
    template: {
      name: "clinisync_appt_reminder",
      language: {
        code: "en",
      },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.patientName },
            { type: "text", text: data.doctorName },
            { type: "text", text: data.appointmentDate },
            { type: "text", text: data.appointmentTime },
            { type: "text", text: data.clinicName },
            { type: "text", text: data.clinicContact },
            { type: "text", text: data.clinicLocation },
          ],
        },
      ],
    },
  };
  try {
    const res = await axios.post(url, requestBody, { headers: headers });
    const responseData = res.data;
    const messageDoc = {
      messageId: responseData.messages[0].id,

      from: process.env.WHATSAPP_PHONE,
      to: responseData.contacts[0].input,
      waId: responseData.contacts[0].wa_id,

      direction: "outgoing",

      template: "clinisync_appt_reminder",
      status: responseData.messages[0].message_status,

      clinicId: data.clinic,
      patientId: data.patientId,
      appointmentId: data.appointmentId,

      rawPayload: requestBody,
    };

    const whatsappDoc = await whatsappMessageModel.create(messageDoc);

    return { success: true, data: whatsappDoc };
  } catch (error) {
    console.dir(error);

    return { success: false, data: error };
  }
}

export async function handleWebhook(data) {
  const whatsappMessageModel = await getMongooseModel(
    "clinisync",
    "WhatsappMessages",
    WhatsappMessage.schema,
  );
  const entry = data.entry[0];
  const changes = entry.changes[0];

  if (changes.field === "messages") {
    const value = changes.value;

    if (value.statuses) {
      const statusObj = value.statuses[0];
      const msgId = statusObj.id;

      const errorObj = statusObj.errors?.[0];

      await whatsappMessageModel.findOneAndUpdate(
        { messageId: msgId },
        {
          $set: {
            status: statusObj.status,
            recipientId: statusObj.recipient_id,

            pricing: {
              billable: statusObj.pricing?.billable,
              category: statusObj.pricing?.category,
              pricingModel: statusObj.pricing?.pricing_model,
              type: statusObj.pricing?.type,
            },

            metadata: {
              phoneNumberId: value.metadata.phone_number_id,
              displayPhoneNumber: value.metadata.display_phone_number,
            },

            ...(errorObj && {
              error: {
                code: errorObj.code,
                type: errorObj.title, // map title → type
                message: errorObj.message,
                error_data: {
                  details: errorObj.error_data?.details,
                },
              },
            }),
          },

          $addToSet: {
            statusTimeline: {
              status: statusObj.status,
              timestamp: Number(statusObj.timestamp),
            },
          },
        },
        { new: true },
      );
    }

    if (value.messages) {
      const msg = value.messages[0];
      const contact = value.contacts?.[0];

      const content = buildWhatsAppContent(msg);
      if (msg.type === "reaction") {
        const reactionMsgId = msg.reaction?.message_id;
        const emoji = msg.reaction?.emoji;

        if (reactionMsgId) {
          if (emoji) {
            await whatsappMessageModel.findOneAndUpdate(
              { messageId: reactionMsgId },
              {
                $set: {
                  "content.reaction": {
                    messageId: reactionMsgId,
                    emoji,
                    reactedBy: msg.from,
                  },
                },
              },
            );
          } else {
            await whatsappMessageModel.findOneAndUpdate(
              { messageId: reactionMsgId },
              {
                $unset: {
                  "content.reaction": "",
                },
              },
            );
          }
        }

        return {
          success: true,
        };
      }

      const createData = {
        messageId: msg.id,
        waId: msg.from,
        from: msg.from,
        to: value.metadata.display_phone_number,

        direction: "incoming",
        type: msg.type,
        status: "sent",

        content,

        statusTimeline: [
          {
            status: "sent",
            timestamp: Number(msg.timestamp),
          },
        ],

        contactProfileName: {
          name: contact?.profile?.name,
        },

        metadata: {
          phoneNumberId: value.metadata.phone_number_id,
          displayPhoneNumber: value.metadata.display_phone_number,
        },

        rawPayload: data,
      };

      await whatsappMessageModel.findOneAndUpdate(
        { messageId: msg.id },
        { $setOnInsert: createData },
        { new: true, upsert: true },
      );
    }
  }

  return { success: true };
}
