import Procedure from "@/models/Procedure";
import { getMongooseModel } from "@/utils/dbConnect";

// create procedure
export async function createProcedure(data, dbName) {
  const proceduresModel = await getMongooseModel(
    dbName,
    "Procedure",
    Procedure.schema
  );
  try {
    const existing = await proceduresModel.findOne({ abbr: data.abbr });
    if (existing) {
      return { success: false, error: "Procedure abbreviation already exists" };
    }

    const procedure = await proceduresModel.create(data);
    return { success: true, data: procedure };
  } catch (error) {
    console.error("Error creating procedure:", error);
    return { success: false, error: error.message };
  }
}

// update procedure
export async function updateProcedure(id, data, dbName) {
  const proceduresModel = await getMongooseModel(
    dbName,
    "Procedure",
    Procedure.schema
  );

  try {
    const updated = await proceduresModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return { success: false, error: "Procedure not found" };
    }

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating procedure:", error);
    return { success: false, error: error.message };
  }
}

//get procedures
export async function getProcedures(dbName) {
  try {
    const proceduresModel = await getMongooseModel(
      dbName,
      "Procedure",
      Procedure.schema
    );
    const procedures = await proceduresModel.find();
    return { success: true, data: procedures };
  } catch (error) {
    console.error("Error getting procedures:", error);
    return { success: false, error: error.message };
  }
}

// get procedure by id
export async function getProcedureById(id, dbName) {
  const proceduresModel = await getMongooseModel(
    dbName,
    "Procedure",
    Procedure.schema
  );

  try {
    const procedure = await proceduresModel.findById(id);
    if (!procedure) {
      return { success: false, error: "Procedure not found" };
    }

    return { success: true, data: procedure };
  } catch (error) {
    console.error("Error getting procedure:", error);
    return { success: false, error: error.message };
  }
}

// delete procedure
export async function deleteProcedure(id, dbName) {
  const proceduresModel = await getMongooseModel(
    dbName,
    "Procedure",
    Procedure.schema
  );

  try {
    const deleted = await proceduresModel.findByIdAndDelete(id);
    if (!deleted) {
      return { success: false, error: "Procedure not found" };
    }

    return { success: true, data: deleted };
  } catch (error) {
    console.error("Error deleting procedure :", error);
    return { success: false, error: error.message };
  }
}
