import { dbConnect } from "@/utils/dbConnect";
import Users from "@/models/Users";
import bcrypt from "bcryptjs";
import Doctor from "@/models/Doctor";

export async function registerUser(data) {
  await dbConnect();
  try {
    if (data.role === "doctor") {
      if (!data.doctorId) {
        return { success: false, error: "Doctor missing" };
      }
      const alreadyAlotted = await Users.findOne({ doctorId: data.doctorId });
      if (alreadyAlotted) {
        return { success: false, error: "Doctor already registered" };
      }
    }

    const existingEmailUsers = await Users.findOne({ email: data.email });
    const existingEmailDoctors = await Doctor.findOne({ email: data.email });

    if (
      existingEmailUsers ||
      (data.role !== "doctor" && existingEmailDoctors)
    ) {
      return { success: false, error: "Email already registered" };
    }

    if (data.phoneNumber && data.phoneNumber.trim() !== "") {
      const existingPhone = await Users.findOne({
        phoneNumber: data.phoneNumber,
      });

      if (existingPhone) {
        return { success: false, error: "Phone number already registered" };
      }
    }

    const hashedPassword = await bcrypt.hash(
      data.password ?? process.env.TEST_PASSWORD,
      10
    );
    const user = await Users.create({ ...data, password: hashedPassword });
    if (data.role === "doctor") {
      await Doctor.findByIdAndUpdate(data.doctorId, { userId: user._id });
    }

    return { success: true, message: "" };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error: error.message };
  }
}

export async function loginUser({ email, password }) {
  await dbConnect();
  try {
    const user = await Users.findOne({ email });
    if (!user) return { success: false, error: "Invalid email or password" };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return { success: false, error: "Invalid email or password" };

    return { success: true, data: user };
  } catch (error) {
    console.error("Error logging in user:", error);
    return { success: false, error: error.message };
  }
}

export async function listUsers({ role }) {
  await dbConnect();
  try {
    let query = {};

    if (role) {
      query.role = role;
    }

    let usersQuery = Users.find(query).select("-password");

    usersQuery = usersQuery.populate("doctorId");

    const users = await usersQuery;

    return { success: true, data: users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: error.message };
  }
}
export async function getUsersByRole() {
  await dbConnect();

  try {
    const counts = await Users.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    return { success: true, data: counts };
  } catch (error) {
    console.error("Error fetching users by role:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUser(id, data) {
  await dbConnect();
  try {
    const role = data.role;

    if (role === "doctor") {
      const existingUser = await Users.findById(id);
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
      const updated = await Users.findByIdAndUpdate(id, data, {
        runValidators: true,
        new: true,
      });

      if (!updated) {
        return { success: false, error: "User not found" };
      }
      return { success: true, data: updated };
    }

    return {};
  } catch (error) {
    console.error("Error updating doctor:", error);
    return { success: false, error: error.message };
  }
}
