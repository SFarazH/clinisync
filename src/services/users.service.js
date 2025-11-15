import Users from "@/models/Users";
import { getMongooseModel } from "@/utils/dbConnect";
import Doctor from "@/models/Doctor";

export async function listUsers({ role, clinicId, dbName }) {
  const usersModel = await getMongooseModel("clinisync", "Users", Users.schema);
  const doctorsModel = await getMongooseModel(dbName, "Doctor", Doctor.schema);

  try {
    let query = {
      clinic: clinicId,
    };

    if (role) {
      query.role = role;
    }

    let usersQuery = usersModel.find(query).select("-password");

    usersQuery = usersQuery;

    const users = await usersQuery;
    const populatedUsers = await Promise.all(
      users.map(async (user) => {
        if (!user.doctorId) return user;

        const doctor = await doctorsModel.findById(user.doctorId).lean();

        return {
          ...user.toObject(),
          doctorId: doctor || null,
        };
      })
    );

    return { success: true, data: populatedUsers };
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
