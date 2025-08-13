import Appointment from "@/models/Appointment";
import Prescription from "@/models/Prescription";
import { dbConnect } from "@/utils/dbConnect";

export async function addPrescription(data) {
  await dbConnect();

  try {
    const existingPrescription = await Prescription.findOne({
      appointment: data.appointment,
    });
    if (existingPrescription) {
      return {
        success: false,
        error: "Prescription for this appointment already exists",
      };
    }

    const prescription = await Prescription.create(data);

    const updated = await Appointment.findByIdAndUpdate(
      data.appointment,
      { prescription: prescription._id, status: "completed" },
      { new: true }
    );
    console.log("Updated appointment:", updated);
    return { success: true, data: prescription, message: "Prescription added" };
  } catch (error) {
    console.error("Error creating prescription:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePrescription(id, data) {
  await dbConnect();

  try {
    const updatedPrescription = await Prescription.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

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
}) {
  await dbConnect();

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
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const prescriptions = await Prescription.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Prescription.countDocuments(query);

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

export async function deletePrescription(id) {
  await dbConnect();

  const prescription = await Prescription.findByIdAndDelete(id);
  if (!prescription) {
    return { success: false, error: "Prescription not found" };
  }
  return { success: true, message: "Prescription deleted" };
}
