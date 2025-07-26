import Procedure from "@/models/Procedure";
import { dbConnect } from "@/utils/dbConnect";

// create procedure
export async function createProcedure(data) {
  await dbConnect();
  console.log(data);
  try {
    const existing = await Procedure.findOne({ abbr: data.abbr });
    if (existing) {
      return { success: false, error: "Procedure abbreviation already exists" };
    }

    const procedure = await Procedure.create(data);
    return { success: true, data: procedure };
  } catch (error) {
    console.error("Error creating procedure:", error);
    return { success: false, error: error.message };
  }
}

// update procedure
export async function updateProcedure(id, data) {
  await dbConnect();

  try {
    const updated = await Procedure.findByIdAndUpdate(id, data, {
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
export async function getProcedures() {
  try {
    await dbConnect();
    const procedures = await Procedure.find();
    return { success: true, data: procedures };
  } catch (error) {
    console.error("Error getting procedures:", error);
    return { success: false, error: error.message };
  }
}

// get procedure by id
export async function getProcedureById(id) {
  await dbConnect();

  try {
    const procedure = await Procedure.findById(id);
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
export async function deleteProcedure(id) {
  await dbConnect();

  try {
    const deleted = await Procedure.findByIdAndDelete(id);
    if (!deleted) {
      return { success: false, error: "Procedure not found" };
    }

    return { success: true, data: deleted };
  } catch (error) {
    console.error("Error deleting procedure :", error);
    return { success: false, error: error.message };
  }
}
