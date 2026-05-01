import Clinic from "@/models/Clinic";
import CronLog from "@/models/CronLog";
import MessageLog from "@/models/MessageLog";
import { getMongooseModel } from "@/utils/dbConnect";
import { sendAppointmentReminder } from "./whatsapp.services";
import Appointment from "@/models/Appointment";

async function getAppointmentsForReminder(dbName) {
  const appointmentsModel = await getMongooseModel(
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

  const now = new Date(); // current UTC time
  const nextTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const pipeline = [
    //match
    {
      //match
      $match: {
        appointmentDateTime: {
          $gte: now,
          $lte: nextTwoHours,
        },
        status: "scheduled",
        "remindersSent.onAppointmentDay": false,
      },
    },

    //lookup
    {
      $lookup: {
        from: "patients",
        localField: "patientId",
        foreignField: "_id",
        as: "patient",
      },
    },
    { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },

    // 🔗 Doctor
    {
      $lookup: {
        from: "doctors",
        localField: "doctorId",
        foreignField: "_id",
        as: "doctor",
      },
    },
    { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        appointmentDateTime: 1,
        startTime: 1,
        endTime: 1,
        status: 1,

        // 📅 Date formats
        formattedDateShort: {
          $dateToString: {
            format: "%d %b",
            date: "$appointmentDateTime",
            timezone: "Asia/Kolkata",
          },
        },
        formattedDateLong: {
          $dateToString: {
            format: "%d %B",
            date: "$appointmentDateTime",
            timezone: "Asia/Kolkata",
          },
        },

        // ⏰ Time format (no leading zero)
        formattedTime: {
          $let: {
            vars: {
              hour: {
                $hour: {
                  date: "$appointmentDateTime",
                  timezone: "Asia/Kolkata",
                },
              },
              minute: {
                $minute: {
                  date: "$appointmentDateTime",
                  timezone: "Asia/Kolkata",
                },
              },
            },
            in: {
              $concat: [
                // Hour (12-hour format)
                {
                  $toString: {
                    $cond: [
                      { $eq: ["$$hour", 0] },
                      12,
                      {
                        $cond: [
                          { $gt: ["$$hour", 12] },
                          { $subtract: ["$$hour", 12] },
                          "$$hour",
                        ],
                      },
                    ],
                  },
                },
                ":",
                // Minute (pad with 0 if needed)
                {
                  $cond: [
                    { $lt: ["$$minute", 10] },
                    { $concat: ["0", { $toString: "$$minute" }] },
                    { $toString: "$$minute" },
                  ],
                },
                " ",
                // AM / PM
                {
                  $cond: [{ $gte: ["$$hour", 12] }, "PM", "AM"],
                },
              ],
            },
          },
        },

        "patient._id": 1,
        "patient.name": 1,
        "patient.phone": 1,

        "doctor._id": 1,
        "doctor.name": 1,
      },
    },
  ];

  const reqappts = await appointmentsModel.aggregate(pipeline);
  return { reqappts };
}

export async function whatsappCron() {
  const clinicsModel = await getMongooseModel(
    "clinisync",
    "Clinics",
    Clinic.schema,
  );

  const messageLogModel = await getMongooseModel(
    "clinisync",
    "MessageLog",
    MessageLog.schema,
  );

  const cronLogModel = await getMongooseModel(
    "clinisync",
    "CronLog",
    CronLog.schema,
  );

  // cron log
  const cronStartTime = new Date();
  const cronLog = await cronLogModel.create({
    startedAt: cronStartTime,
    status: "running",
  });

  try {
    const pipeline = [
      {
        $match: {
          isLiveClinic: true,
          "features.whatsapp-reminders": true,
          whatsappTemplate: { $exists: true },
          "whatsappMsgFrequency.onAppointmentDay": true,
        },
      },
    ];

    const clinics = await clinicsModel.aggregate(pipeline);

    let totalAppointments = 0;
    let totalAttempted = 0;
    let totalSent = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    for (const clinic of clinics) {
      console.log("Processing clinic:", clinic.databaseName);

      const { reqappts = [] } = await getAppointmentsForReminder(
        clinic.databaseName,
      );

      totalAppointments += reqappts.length;

      for (const appt of reqappts) {
        const scheduledFor = appt.appointmentDateTime;

        try {
          const existing = await messageLogModel.findOne({
            appointmentId: appt._id,
            template: clinic.whatsappTemplate,
            scheduledFor,
          });

          if (existing && existing.status === "sent") {
            totalSkipped++;
            continue;
          }

          totalAttempted++;

          const log = await messageLogModel.create({
            appointmentId: appt._id,
            patientId: appt.patient?._id,
            clinicId: clinic._id,
            template: clinic.whatsappTemplate,
            scheduledFor,
            status: "pending",
          });

          const result = await sendAppointmentReminder({
            appointment: appt,
            clinic,
            isCron: true,
          });

          if (!result.success) {
            totalFailed++;

            await messageLogModel.findByIdAndUpdate(log._id, {
              status: "failed",
              error: result?.error || "Unknown error",
            });

            continue;
          }

          await messageLogModel.findByIdAndUpdate(log._id, {
            status: "sent",
            sentAt: new Date(),
          });

          totalSent++;
        } catch (err) {
          console.error("❌ Error in appointment:", err);

          totalFailed++;

          await messageLogModel.findOneAndUpdate(
            {
              appointmentId: appt._id,
              template: clinic.whatsappTemplate,
              scheduledFor,
            },
            {
              status: "failed",
              error: err.message,
            },
          );
        }
      }
    }

    const cronCompletedAt = new Date();

    await cronLogModel.findByIdAndUpdate(cronLog._id, {
      status: "success",
      completedAt: cronCompletedAt,
      durationMs: cronCompletedAt.getTime() - cronStartTime.getTime(),
      metrics: {
        clinicsProcessed: clinics.length,
        totalAppointments,
        totalAttempted,
        totalSent,
        totalFailed,
        totalSkipped,
      },
    });

    return {
      success: true,
      data: {
        clinicsProcessed: clinics.length,
        totalAppointments,
        totalAttempted,
        totalSent,
        totalFailed,
        totalSkipped,
      },
    };
  } catch (err) {
    const cronCompletedAt = new Date();

    await cronLogModel.findByIdAndUpdate(cronLog._id, {
      status: "failed",
      completedAt: cronCompletedAt,
      durationMs: cronCompletedAt.getTime() - cronStartTime.getTime(),
      error: err.message,
    });

    return {
      success: false,
      error: err.message,
    };
  }
}
