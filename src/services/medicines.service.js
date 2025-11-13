import Medicine from "@/models/Medicine";
import { dbConnect, getMongooseModel } from "@/utils/dbConnect";

export async function getPaginatedMedicines({
  page = 1,
  limit = 10,
  search = "",
  dbName,
}) {
  // await dbConnect();
  const medicinesModel = await getMongooseModel(
    dbName,
    "Medicine",
    Medicine.schema
  );

  try {
    if (search.length < 4) {
      return {
        success: true,
        data: [],
        pagination: {
          total: 0,
          page,
          pages: 0,
          limit,
        },
        message: "Search term must be at least 4 characters.",
      };
    }
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { shortComposition1: { $regex: search, $options: "i" } },
            { shortComposition2: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const medicines = await medicinesModel
      .find(query)
      .select("id name shortComposition1 shortComposition2");
    // .skip((page - 1) * limit)
    // .limit(limit);
    //   .sort({ price: 1 }); // ascending price

    const total = await medicinesModel.countDocuments(query);

    return {
      success: true,
      data: medicines,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    };
  } catch (error) {
    console.error("Error listing medicines:", error);
    return { success: false, error: error.message };
  }
}
