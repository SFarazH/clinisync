import Doctor from "@/models/Doctor";
import { getMongooseModel } from "@/utils/dbConnect";
import mongoose from "mongoose";

// create doctor
export async function addDoctor(data, dbName) {
  const doctorsModel = await getMongooseModel(dbName, "Doctor", Doctor.schema);

  try {
    const existingEmail = await doctorsModel.findOne({ email: data.email });
    if (existingEmail) {
      return { success: false, error: "Email already exists" };
    }

    const existingPhone = await doctorsModel.findOne({
      phoneNumber: data.phoneNumber,
    });
    if (existingPhone) {
      return { success: false, error: "Phone number already exists" };
    }

    const doctor = await doctorsModel.create(data);
    return { success: true, data: doctor };
  } catch (error) {
    console.error("Error creating doctor:", error);
    return { success: false, error: error.message };
  }
}

// update doctor
export async function updateDoctor(id, data) {
  const doctorsModel = await getMongooseModel(dbName, "Doctor", Doctor.schema);

  try {
    const updated = await doctorsModel.findByIdAndUpdate(id, data, {
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
export async function getAllDoctors(getUnassigned) {
  const doctorsModel = await getMongooseModel(dbName, "Doctor", Doctor.schema);

  try {
    let query = {};
    if (getUnassigned) {
      query = { userId: { $exists: false } };
    }

    const doctors = await doctorsModel.find(query).sort({ createdAt: -1 });

    return { success: true, data: doctors };
  } catch (error) {
    console.error("Error getting doctors:", error);
    return { success: false, error: error.message };
  }
}

// get doctor by ID
export async function getDoctorById(userId) {
  const doctorsModel = await getMongooseModel(dbName, "Doctor", Doctor.schema);

  try {
    const doctor = await doctorsModel.findOne({
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
//TODO: remove user also!!
export async function deleteDoctor(id) {
  const doctorsModel = await getMongooseModel(dbName, "Doctor", Doctor.schema);

  try {
    const deleted = await doctorsModel.findByIdAndDelete(id);
    if (!deleted) {
      return { success: false, error: "Doctor not found" };
    }

    return { success: true, data: deleted };
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return { success: false, error: error.message };
  }
}
