import LabWork from "@/models/LabWork";
import { dbConnect } from "@/utils/dbConnect";

export async function addLabWork(data) {
  await dbConnect();

  try {
    const labWork = await LabWork.create(data);
    return { success: true, data: labWork };
  } catch (error) {
    console.error("Error creating lab work:", error);
    return { success: false, error: error.message };
  }
}

export async function updateLabWork(id, data) {
  await dbConnect();

  try {
    const updated = await LabWork.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return { success: false, error: "Lab work not found" };
    }

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating lab work:", error);
    return { success: false, error: error.message };
  }
}

export async function getAllLabWorks({
  paginate = true,
  page = 1,
  limit = 10,
  appointment,
  isReceived,
}) {
  await dbConnect();
  try {
    const query = {};

    if (appointment) {
      query.appointment = appointment;
    }
    if (isReceived) {
      query.isReceived = isReceived;
    }
    let labWorkQuery = LabWork.find(query)
      .populate("patientId", "name")
      .populate({
        path: "appointment",
        select: "date procedureId",
        populate: {
          path: "procedureId",
          select: "name",
        },
      });
    let total;
    if (paginate) {
      labWorkQuery = labWorkQuery.skip((page - 1) * limit).limit(limit);
      total = await LabWork.countDocuments(query);
    }

    const labWorkData = await labWorkQuery;
    const res = { success: true, data: labWorkData };
    if (paginate) {
      res.pagination = {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      };
    }
    return res;
  } catch (error) {
    console.error("Error fetching lab works:", error);
    return { success: false, error: error.message };
  }
}

export async function markLabWorkComplete(id) {
  await dbConnect();

  try {
    const updated = await LabWork.findByIdAndUpdate(
      id,
      { isReceived: true },
      { new: true }
    );

    if (!updated) {
      return { success: false, error: "Lab work not found" };
    }

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error marking lab work complete:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteLabWork(id) {
  await dbConnect();

  try {
    const deleted = await LabWork.findByIdAndDelete(id);
    if (!deleted) {
      return { success: false, error: "Lab work not found" };
    }

    return { success: true, data: deleted };
  } catch (error) {
    console.error("Error deleting lab work:", error);
    return { success: false, error: error.message };
  }
}
