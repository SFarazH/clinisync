import { getMongooseModel } from "@/utils/dbConnect";
import Users from "@/models/Users";
import bcrypt from "bcryptjs";
import Doctor from "@/models/Doctor";
import Clinic from "@/models/Clinic";
import { roles } from "@/utils/role-permissions.mapping";

export async function registerUser(data, dbName) {
  try {
    const usersModel = await getMongooseModel(
      "clinisync",
      "Users",
      Users.schema,
    );

    const doctorsModel = await getMongooseModel(
      dbName,
      "Doctor",
      Doctor.schema,
    );

    const clinicsModel = await getMongooseModel(
      "clinisync",
      "Clinic",
      Clinic.schema,
    );
    const clinicDoc = await clinicsModel.findOne({ databaseName: dbName });

    if (data.role === "doctor") {
      if (!data.doctorId) {
        return { success: false, error: "Doctor missing" };
      }
      const alreadyAlotted = await usersModel.findOne({
        doctorId: data.doctorId,
      });
      if (alreadyAlotted) {
        return { success: false, error: "Doctor already registered" };
      }
    }

    const existingEmailUsers = await usersModel.findOne({ email: data.email });
    const existingEmailDoctors = await doctorsModel.findOne({
      email: data.email,
    });

    if (
      existingEmailUsers ||
      (data.role !== "doctor" && existingEmailDoctors)
    ) {
      return { success: false, error: "Email already registered" };
    }

    if (data.phoneNumber && data.phoneNumber.trim() !== "") {
      const existingPhone = await usersModel.findOne({
        phoneNumber: data.phoneNumber,
      });

      if (existingPhone) {
        return { success: false, error: "Phone number already registered" };
      }
    }

    const hashedPassword = await bcrypt.hash(
      data.password ?? process.env.TEST_PASSWORD,
      10,
    );
    const user = await usersModel.create({
      ...data,
      password: hashedPassword,
      clinic: clinicDoc._id,
    });
    if (data.role === "doctor") {
      await doctorsModel.findByIdAndUpdate(data.doctorId, { userId: user._id });
    }

    return { success: true, message: "" };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error: error.message };
  }
}

export async function addAdmin(data) {
  const usersModel = await getMongooseModel("clinisync", "Users", Users.schema);

  try {
    const existingEmailUsers = await usersModel.findOne({ email: data.email });
    if (existingEmailUsers) {
      return { success: false, error: "Email already registered" };
    }

    if (data.phoneNumber && data.phoneNumber.trim() !== "") {
      const existingPhone = await usersModel.findOne({
        phoneNumber: data.phoneNumber,
      });

      if (existingPhone) {
        return { success: false, error: "Phone number already registered" };
      }
    }

    const hashedPassword = await bcrypt.hash(
      data.password ?? process.env.TEST_PASSWORD,
      10,
    );

    const newUser = await usersModel.create({
      ...data,
      password: hashedPassword,
      role: roles.ADMIN,
    });

    return {
      success: true,
      message: "Clinic admin created successfully",
      user: newUser,
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error: error.message };
  }
}

export async function loginUser({ email, password }) {
  const usersModel = await getMongooseModel("clinisync", "Users", Users.schema);
  await getMongooseModel("clinisync", "Clinic", Clinic.schema);

  try {
    const user = await usersModel.findOne({ email }).populate("clinic").exec();
    if (!user) return { success: false, error: "Invalid email or password" };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return { success: false, error: "Invalid email or password" };
    return { success: true, data: user };
  } catch (error) {
    console.error("Error logging in user:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUser(id, data) {
  const usersModel = await getMongooseModel("clinisync", "Users", Users.schema);

  try {
    const role = data.role;

    if (role === "doctor") {
      const existingUser = await usersModel.findById(id);
      if (!existingUser) {
        return { success: false, error: "User not found" };
      }
      if ((existingUser.address || "").trim() === (data.address || "").trim()) {
        return { success: true, message: "No updates" };
      } else {
        existingUser.address = data.address.trim();
        await existingUser.save();
        return { success: true, message: "Address updated" };
      }
    } else {
      const updated = await usersModel.findByIdAndUpdate(id, data, {
        runValidators: true,
        new: true,
      });

      if (!updated) {
        return { success: false, error: "User not found" };
      }
      return { success: true, data: updated };
    }
  } catch (error) {
    console.error("Error updating doctor:", error);
    return { success: false, error: error.message };
  }
}

export async function listUnallottedAdmins() {
  const usersModel = await getMongooseModel("clinisync", "Users", Users.schema);

  try {
    const pipeline = [
      {
        $match: {
          role: "admin",
          $or: [{ clinic: null }, { clinic: { $exists: false } }],
        },
      },
    ];

    const usersList = await usersModel.aggregate(pipeline);
    return { success: true, data: usersList };
  } catch (error) {
    console.error("Error fetching user list:", error);
    return { success: false, error: error.message };
  }
}

export async function allotAdminToClinic(clinicId, userId) {
  const session = await mongoose.startSession();

  const usersModel = await getMongooseModel("clinisync", "Users", Users.schema);

  const clinicsModel = await getMongooseModel(
    "clinisync",
    "Clinics",
    Clinic.schema,
  );

  try {
    session.startTransaction();

    // Check if clinic exists
    const clinic = await clinicsModel.findById(clinicId).session(session);

    if (!clinic) {
      return { success: false, error: "Clinic not found" };
    }

    // Check if user exists
    const user = await usersModel.findById(userId).session(session);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Update clinic → assign admin
    await clinicsModel.updateOne(
      { _id: clinicId },
      {
        $set: {
          admin: userId, // assuming field name is admin
        },
      },
      { session },
    );

    // Update user → assign clinic
    await usersModel.updateOne(
      { _id: userId },
      {
        $set: {
          clinic: clinicId,
        },
      },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      message: "Admin allotted to clinic successfully",
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Transaction error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}
