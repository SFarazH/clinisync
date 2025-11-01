import Invoice from "@/models/Invoice";
import LabWork from "@/models/LabWork";
import { dbConnect } from "@/utils/dbConnect";
import mongoose from "mongoose";

export async function addLabWork(data) {
  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const labWork = await LabWork.create([data], { session });

    const invoice = await Invoice.create(
      [
        {
          invoiceType: "labWork",
          transactionType: "expense",
          patientId: data.patientId,
          labWork: labWork[0]._id,
          totalAmount: parseInt(data.amount),
          amountPaid: 0,
          isPaymentComplete: false,
        },
      ],
      { session }
    );

    labWork[0].invoice = invoice[0]._id;
    await labWork[0].save({ session });

    // 4️⃣ Commit transaction
    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      data: { labWork: labWork[0], invoice: invoice[0] },
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error creating lab work/invoice:", error);
    return { success: false, error: error.message };
  }
}

export async function updateLabWork(id, data) {
  await dbConnect();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️⃣ Update the LabWork
    const updatedLabWork = await LabWork.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      session,
    });

    if (!updatedLabWork) {
      await session.abortTransaction();
      session.endSession();
      return { success: false, error: "Lab work not found" };
    }

    if (parseInt(data.amount) !== undefined && updatedLabWork.invoice) {
      const invoiceToUpdate = await Invoice.findById(updatedLabWork.invoice);
      const isPending = parseInt(data.amount) > invoiceToUpdate.amountPaid;
      const updatedInvoice = await Invoice.findByIdAndUpdate(
        updatedLabWork.invoice,
        { totalAmount: parseInt(data.amount), isPaymentComplete: !isPending },
        { new: true, session }
      );

      if (!updatedInvoice) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: "Invoice not found" };
      }
    }

    // 3️⃣ Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return { success: true, data: updatedLabWork };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error updating lab work:", error);
    return { success: false, error: error.message };
  }
}

export async function getAllLabWorks({
  paginate = true,
  page = 1,
  limit = 10,
  patientId,
  isReceived,
}) {
  await dbConnect();
  try {
    const query = {};

    if (patientId) {
      query.patientId = patientId;
    }
    if (isReceived) {
      query.isReceived = isReceived;
    }
    let labWorkQuery = LabWork.find(query).populate("patientId", "name");
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️⃣ Find the lab work
    const labWork = await LabWork.findById(id).session(session);
    if (!labWork) {
      await session.abortTransaction();
      session.endSession();
      return { success: false, error: "Lab work not found" };
    }

    // 2️⃣ Delete the related invoice if it exists
    if (labWork.invoice) {
      await Invoice.findByIdAndDelete(labWork.invoice, { session });
    }

    // 3️⃣ Delete the lab work itself
    await LabWork.findByIdAndDelete(id, { session });

    // 4️⃣ Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return { success: true, data: labWork };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting lab work and invoice:", error);
    return { success: false, error: error.message };
  }
}
