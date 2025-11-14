import Users from "@/models/Users";
import Clinic from "@/models/Clinic";
import { getMongooseModel } from "@/utils/dbConnect";

export async function listUsers({ role, clinicId }) {
  const usersModel = await getMongooseModel("clinisync", "Users", Users.schema);
  try {
    let query = {
      clinic: clinicId,
    };

    if (role) {
      query.role = role;
    }

    let usersQuery = usersModel.find(query).select("-password");

    usersQuery = usersQuery.populate("doctorId");

    const users = await usersQuery;

    return { success: true, data: users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: error.message };
  }
}

export async function getUsersByRole(clinicId) {
  const usersModel = await getMongooseModel("clinisync", "Users", Users.schema);
  const usersPipeline = [
    {
      $match: {
        clinic: clinicId,
      },
    },
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ];
  try {
    const counts = await usersModel.aggregate(usersPipeline);
    return { success: true, data: counts };
  } catch (error) {
    console.error("Error fetching users by role:", error);
    return { success: false, error: error.message };
  }
}
