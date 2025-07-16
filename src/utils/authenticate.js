import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Users from "@/models/Users";
import { cookies } from "next/headers";
import { dbConnect } from "./dbConnect";

dotenv.config({ quiet: true });

export const authenticate = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await dbConnect();
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await Users.findById(decodedToken.id).select(
      "_id name email role"
    );

    if (!user) {
      return { success: false, message: "User not found" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Error during token verification:", error);
    return { success: false, message: "User not found" };
  }
};
