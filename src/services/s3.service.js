import Appointment from "@/models/Appointment";
import { getMongooseModel } from "@/utils/dbConnect";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const s3Upload = async (file, appointmentId, dbName) => {
  const appointmentsModel = await getMongooseModel(
    dbName,
    "Appointment",
    Appointment.schema
  );

  const appointment = await appointmentsModel.findById(appointmentId);
  if (!appointment) {
    return "Appointment not found";
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const keyArr = file.name.split(".");
  const key = `${keyArr
    .slice(0, -1)
    .join("-")
    .replace(/\s+/g, "")}-${Date.now()}.${keyArr[keyArr.length - 1]}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  };

  const attachmentItem = {
    fileName: file.name,
    s3FileKey: key,
  };

  try {
    await s3.send(new PutObjectCommand(params));
    appointment.attachments.push(attachmentItem);
    await appointment.save();
    return { success: true, data: key };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
};

export const getS3Image = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  const s3Object = await s3.send(command);
  const stream = s3Object.Body;

  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  return { bufferResponse: buffer, contentType: s3Object.ContentType };
};
