import Patient from "@/models/Patient";
import { getMongooseModel } from "@/utils/dbConnect";

// create patient
export async function createPatient(data, dbName) {
  const patientsModel = await getMongooseModel(
    dbName,
    "Patient",
    Patient.schema
  );

  try {
    if (data.email && data.email.trim() !== "") {
      const existingPatient = await patientsModel.findOne({
        email: data.email,
      });

      if (existingPatient) {
        return { success: false, error: "Email already exists" };
      }
    }

    if (data.email === "") data.email = null;

    const existingPatientByPhone = await patientsModel.findOne({
      phone: data.phone,
    });

    if (existingPatientByPhone) {
      if (existingPatientByPhone.name === data.name) {
        return {
          success: false,
          error: "Phone number already registered for this name",
        };
      }
    }

    const patient = await patientsModel.create(data);
    return { success: true, data: patient };
  } catch (error) {
    console.error("Error creating patient:", error);
    return { success: false, error: error.message };
  }
}

// update patient
export async function updatePatient(id, data, dbName) {
  const patientsModel = await getMongooseModel(
    dbName,
    "Patient",
    Patient.schema
  );

  try {
    const updatedPatient = await patientsModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedPatient) {
      return { success: false, error: "Patient not found" };
    }

    return { success: true, data: updatedPatient };
  } catch (error) {
    console.error("Error updating patient:", error);
    return { success: false, error: error.message };
  }
}

export async function listPatients(dbName) {
  const patientsModel = await getMongooseModel(
    dbName,
    "Patient",
    Patient.schema
  );
  try {
    const patients = await patientsModel.find({}, "name dob");
    return {
      success: true,
      data: patients,
    };
  } catch (error) {
    console.error("Error listing patients:", error);
    return { success: false, error: error.message };
  }
}

// list patients
export async function getPaginatedPatients({
  page = 1,
  limit = 10,
  search = "",
  dbName,
}) {
  const patientsModel = await getMongooseModel(
    dbName,
    "Patient",
    Patient.schema
  );

  try {
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const patients = await patientsModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await patientsModel.countDocuments(query);

    return {
      success: true,
      data: patients,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    };
  } catch (error) {
    console.error("Error listing patients:", error);
    return { success: false, error: error.message };
  }
}

// get patient by id
export async function getPatientById(id, dbName) {
  const patientsModel = await getMongooseModel(
    dbName,
    "Patient",
    Patient.schema
  );

  const patient = await patientsModel.findById(id);
  if (!patient) {
    return { success: false, error: "Patient not found" };
  }
  return { success: true, data: patient };
}

// search patients
export async function searchPatients(searchTerm, dbName) {
  const patientsModel = await getMongooseModel(
    dbName,
    "Patient",
    Patient.schema
  );
  try {
    const query = searchTerm
      ? {
          $or: [
            { name: { $regex: searchTerm, $options: "i" } },
            { email: { $regex: searchTerm, $options: "i" } },
          ],
        }
      : {};

    const patients = await patientsModel
      .find(query)
      .limit(20)
      .sort({ createdAt: -1 });

    return {
      success: true,
      data: patients,
      count: patients.length,
      message: "Search completed successfully",
    };
  } catch (error) {
    console.error("Error searching patients:", error);
    return { success: false, error: error.message };
  }
}

// delete patients
export async function deletePatient(id, dbName) {
  const patientsModel = await getMongooseModel(
    dbName,
    "Patient",
    Patient.schema
  );

  const patient = await patientsModel.findByIdAndDelete(id);
  if (!patient) {
    return { success: false, error: "Patient not found" };
  }
  return { success: true, message: "Patient deleted" };
}
