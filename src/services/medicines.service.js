import Medicine from "@/models/Medicine";
import { dbConnect } from "@/utils/dbConnect";

export async function getPaginatedMedicines({
  page = 1,
  limit = 10,
  search = "",
}) {
  await dbConnect();

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

    const medicines = await Medicine.find(query).select(
      "id name shortComposition1 shortComposition2"
    );
    // .skip((page - 1) * limit)
    // .limit(limit);
    //   .sort({ price: 1 }); // ascending price

    const total = await Medicine.countDocuments(query);

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
