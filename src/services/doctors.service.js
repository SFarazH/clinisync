import Doctor from "@/models/Doctor";
import { dbConnect } from "@/utils/dbConnect";
import mongoose from "mongoose";

// create doctor
export async function addDoctor(data) {
  await dbConnect();

  try {
    const existingEmail = await Doctor.findOne({ email: data.email });
    if (existingEmail) {
      return { success: false, error: "Email already exists" };
    }

    const existingPhone = await Doctor.findOne({ phone: data.phone });
    if (existingPhone) {
      return { success: false, error: "Phone number already exists" };
    }

    const doctor = await Doctor.create(data);
    return { success: true, data: doctor };
  } catch (error) {
    console.error("Error creating doctor:", error);
    return { success: false, error: error.message };
  }
}

// update doctor
export async function updateDoctor(id, data) {
  await dbConnect();

  try {
    const updated = await Doctor.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return { success: false, error: "Doctor not found" };
    }

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating doctor:", error);
    return { success: false, error: error.message };
  }
}

// get all doctors
export async function getAllDoctors() {
  await dbConnect();

  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    return { success: true, data: doctors };
  } catch (error) {
    console.error("Error getting doctors:", error);
    return { success: false, error: error.message };
  }
}

// get doctor by ID
export async function getDoctorById(userId) {
  await dbConnect();

  try {
    const doctor = await Doctor.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (!doctor) {
      return { success: false, error: "Doctor not found" };
    }

    return { success: true, data: doctor };
  } catch (error) {
    console.error("Error getting doctor by ID:", error);
    return { success: false, error: error.message };
  }
}

// delete doctor
export async function deleteDoctor(id) {
  await dbConnect();

  try {
    const deleted = await Doctor.findByIdAndDelete(id);
    if (!deleted) {
      return { success: false, error: "Doctor not found" };
    }

    return { success: true, data: deleted };
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return { success: false, error: error.message };
  }
}
