import Clinic from "@/models/Clinic";
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

    const clinics = await clinicsModel.find({});
    return { success: true, data: clinics };
  } catch (error) {
    console.error("Error creating clinic:", err);
    return { success: false, message: err };
  }
}

export async function updateClinic(id, data) {
  try {
    const clinicsModel = await getMongooseModel(
      "clinisync",
      "Clinic",
      Clinic.schema,
    );

    const forbidden = ["databaseName"];
    forbidden.forEach((field) => delete data[field]);

    const updated = await clinicsModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return {
        success: false,
        error: "Clinic not found",
      };
    }

    return {
      success: true,
      data: updated,
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
