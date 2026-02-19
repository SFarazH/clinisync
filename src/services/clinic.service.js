import Clinic from "@/models/Clinic";
import User from "@/models/Users";
import { getMongooseModel } from "@/utils/dbConnect";

export async function addClinic(clinicData) {
  const { name, databaseName } = clinicData;
  try {
    if (!name || !databaseName) {
      return {
        success: false,
        error: "Clinic name and database name required",
      };
    }

    const clinicsModel = await getMongooseModel(
      "clinisync",
      "Clinic",
      Clinic.schema,
    );

    const existingClinic = await clinicsModel.findOne({ databaseName });
    if (existingClinic) {
      return {
        success: false,
        error: `Clinic with database name "${databaseName}" already exists.`,
      };
    }

    const newClinic = await clinicsModel.create({
      ...clinicData,
      createdAt: new Date(),
    });

    return { success: true, data: newClinic };
  } catch (err) {
    console.error("Error creating clinic:", err);
    return { success: false, message: err };
  }
}

export async function getClinics() {
  try {
    const clinicsModel = await getMongooseModel(
      "clinisync",
      "Clinic",
      Clinic.schema,
    );

    await getMongooseModel("clinisync", "User", User.schema);

    const clinics = await clinicsModel.find({}).populate({
      path: "admin",
      select: "name",
    });
    return { success: true, data: clinics };
  } catch (error) {
    console.error("Error fetching clinic:", error);
    return { success: false, message: error };
  }
}

export async function updateClinic(id, data) {
  try {
    const clinicsModel = await getMongooseModel(
      "clinisync",
      "Clinic",
      Clinic.schema,
    );

    const usersModel = await getMongooseModel("clinisync", "User", User.schema);

    const forbidden = ["databaseName"];
    forbidden.forEach((field) => delete data[field]);

    const existingClinic = await clinicsModel.findById(id);
    if (!existingClinic) {
      return { success: false, error: "Clinic not found" };
    }

    let adminChanged = false;
    let oldAdmin;
    let newAdmin;

    if ("admin" in data) {
      oldAdmin = existingClinic.admin?.toString();
      newAdmin = data.admin?.toString();

      if (oldAdmin !== newAdmin) {
        adminChanged = true;
      }
    }

    if (adminChanged) {
      // Remove clinic from old admin
      if (oldAdmin) {
        await usersModel.findByIdAndUpdate(oldAdmin, {
          $unset: { clinic: "" },
        });
      }

      // Assign clinic to new admin
      await usersModel.findByIdAndUpdate(newAdmin, {
        clinic: id,
      });
    }

    const updatedClinic = await clinicsModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedClinic) {
      return {
        success: false,
        error: "Clinic not found",
      };
    }

    return {
      success: true,
      data: updatedClinic,
    };
  } catch (error) {
    console.error("Error updating clinic:", error);
    return { success: false, error: error.message };
  }
}

export async function getClinicById(id) {
  const clinicsModel = await getMongooseModel(
    "clinisync",
    "Clinic",
    Clinic.schema,
  );

  const clinic = await clinicsModel.findOne({ _id: id });

  if (!clinic)
    return {
      success: false,
      error: "Clinic not found",
    };

  return {
    success: true,
    data: clinic,
  };
}
