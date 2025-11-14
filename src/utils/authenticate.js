import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Users from "@/models/Users";
import Clinic from "@/models/Clinic";
import { cookies } from "next/headers";
import { getMongooseModel } from "./dbConnect";

dotenv.config({ quiet: true });

export const authenticate = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const usersModel = await getMongooseModel(
      "clinisync",
      "Users",
      Users.schema
    );

    const clinicsModel = await getMongooseModel(
      "clinisync",
      "Clinic",
      Clinic.schema
    );
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await usersModel
      .findById(decodedToken.id)
      .populate("clinic")
      .select("_id name email role clinic");

    if (!user) {
      return { success: false, message: "User not found" };
    }

    let clinic = user.clinic;
    if (!clinic && user.clinic?._id) {
      clinic = await clinicsModel.findById(user.clinic._id);
    }

    return { success: true, data: { user, clinic } };
  } catch (error) {
    console.error("Error during token verification:", error);
    return { success: false, message: "User not found" };
  }
};
