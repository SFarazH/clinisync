import Appointment from "@/models/Appointment";
import Prescription from "@/models/Prescription";
import { getMongooseModel } from "@/utils/dbConnect";

export async function addPrescription(data, dbName) {
  const prescriptionsModel = await getMongooseModel(
    dbName,
    "Prescription",
    Prescription.schema
  );

  const appointmentsModel = await getMongooseModel(
    dbName,
    "Appointment",
    Appointment.schema
  );

  try {
    const existingPrescription = await prescriptionsModel.findOne({
      appointment: data.appointment,
    });
    if (existingPrescription) {
      return {
        success: false,
        error: "Prescription for this appointment already exists",
      };
    }

    const appointmentDoc = await appointmentsModel.findById(data.appointment);

    const prescription = await prescriptionsModel.create({
      ...data,
      patient: appointmentDoc.patientId,
    });

    await appointmentsModel.findByIdAndUpdate(
      data.appointment,
      { prescription: prescription._id, status: "completed" },
      { new: true }
    );
    return { success: true, data: prescription, message: "Prescription added" };
  } catch (error) {
    console.error("Error creating prescription:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePrescription(id, data, dbName) {
  const prescriptionsModel = await getMongooseModel(
    dbName,
    "Prescription",
    Prescription.schema
  );

  try {
    const forbiddenFields = ["patient", "appointment"];
    forbiddenFields.forEach((field) => {
      if (field in data) {
        delete data[field];
      }
    });

    const updatedPrescription = await prescriptionsModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedPrescription) {
      return { success: false, error: "Prescription not found" };
    }

    return { success: true, data: updatedPrescription };
  } catch (error) {
    console.error("Error updating prescription:", error);
    return { success: false, error: error.message };
  }
}

export async function getPrescriptions({
  page = 1,
  limit = 10,
  search = "",
  startDate = "",
  endDate = "",
  dbName,
}) {
  const prescriptionsModel = await getMongooseModel(
    dbName,
    "Prescription",
    Prescription.schema
  );

  try {
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      const queryRange = {};

      if (startDate) {
        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);
        queryRange.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        queryRange.$lte = end;
      }

      query.createdAt = queryRange;
    }

    const prescriptions = await prescriptionsModel
      .find(query)
      .populate("patient", "name")
      .populate({
        path: "appointment",
        select: "date doctorId",
        populate: {
          path: "doctorId",
          select: "name",
        },
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await prescriptionsModel.countDocuments(query);

    return {
      success: true,
      data: prescriptions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    };
  } catch (error) {
    console.error("Error getting prescriptions:", error);
    return { success: false, error: error.message };
  }
}

// TODO: check if appt needs to be removed
export async function deletePrescription(id, dbName) {
  const prescriptionsModel = await getMongooseModel(
    dbName,
    "Prescription",
    Prescription.schema
  );

  const prescription = await prescriptionsModel.findByIdAndDelete(id);
  if (!prescription) {
    return { success: false, error: "Prescription not found" };
  }
  return { success: true, message: "Prescription deleted" };
}
