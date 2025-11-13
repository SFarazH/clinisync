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
      Clinic.schema
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
