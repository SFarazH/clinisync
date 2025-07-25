import { dbConnect } from "@/utils/dbConnect";
import Users from "@/models/Users";
import bcrypt from "bcryptjs";

export async function registerUser(data) {
  await dbConnect();
  try {
    const existingEmail = await Users.findOne({ email: data.email });
    if (existingEmail) {
      return { success: false, error: "Email already registered" };
    }

    const existingPhone = await Users.findOne({
      phoneNumber: data.phoneNumber,
    });
    if (existingPhone) {
      return { success: false, error: "Phone number already registered" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await Users.create({ ...data, password: hashedPassword });

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
