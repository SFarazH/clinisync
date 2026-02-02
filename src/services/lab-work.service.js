import Invoice from "@/models/Invoice";
import LabWork from "@/models/LabWork";
import { getDatabaseConnection, getMongooseModel } from "@/utils/dbConnect";

export async function addLabWork(data, dbName) {
  const labWorkModel = await getMongooseModel(
    dbName,
    "LabWork",
    LabWork.schema
  );

  const invoicesModel = await getMongooseModel(
    dbName,
    "Invoice",
    Invoice.schema
  );

  const conn = await getDatabaseConnection(dbName);
  const session = await conn.startSession();
  session.startTransaction();

  try {
    const labWork = await labWorkModel.create([data], { session });

    const invoice = await invoicesModel.create(
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

export async function updateLabWork(id, data, dbName) {
  const labWorkModel = await getMongooseModel(
    dbName,
    "LabWork",
    LabWork.schema
  );

  const invoicesModel = await getMongooseModel(
    dbName,
    "Invoice",
    Invoice.schema
  );

  const conn = await getDatabaseConnection(dbName);
  const session = await conn.startSession();
  session.startTransaction();

  try {
    // 1️⃣ Update the LabWork
    const updatedLabWork = await labWorkModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      session,
    });

    if (!updatedLabWork) {
      await session.abortTransaction();
      session.endSession();
      return { success: false, error: "Lab work not found" };
    }

    if (data.amount) {
      if (parseInt(data.amount) !== undefined && updatedLabWork.invoice) {
        const invoiceToUpdate = await invoicesModel.findById(
          updatedLabWork.invoice
        );
        const isPending = parseInt(data.amount) > invoiceToUpdate.amountPaid;
        const updatedInvoice = await invoicesModel.findByIdAndUpdate(
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
  startDate = null,
  endDate = null,
  dbName,
}) {
  const labWorkModel = await getMongooseModel(
    dbName,
    "LabWork",
    LabWork.schema
  );

  try {
    const query = {};

    if (patientId) {
      query.patientId = patientId;
    }
    if (isReceived) {
      query.isReceived = isReceived;
    }

    if (startDate || endDate) {
      const queryRange = {};

      if (startDate) {
        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);
        queryRange.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        queryRange.$lte = end;
      }

      query.createdAt = queryRange;
    }

    let labWorkQuery = labWorkModel.find(query).populate("patientId", "name");
    let total;
    if (paginate) {
      labWorkQuery = labWorkQuery.skip((page - 1) * limit).limit(limit);
      total = await labWorkModel.countDocuments(query);
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

export async function markLabWorkComplete(id, dbName) {
  const labWorkModel = await getMongooseModel(
    dbName,
    "LabWork",
    LabWork.schema
  );

  try {
    const updated = await labWorkModel.findByIdAndUpdate(
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

export async function deleteLabWork(id, dbName) {
  const labWorkModel = await getMongooseModel(
    dbName,
    "LabWork",
    LabWork.schema
  );

  const invoicesModel = await getMongooseModel(
    dbName,
    "Invoice",
    Invoice.schema
  );

  const conn = await getDatabaseConnection(dbName);
  const session = await conn.startSession();
  session.startTransaction();

  try {
    const labWork = await labWorkModel.findById(id).session(session);
    if (!labWork) {
      await session.abortTransaction();
      session.endSession();
      return { success: false, error: "Lab work not found" };
    }

    if (labWork.invoice) {
      await invoicesModel.findByIdAndDelete(labWork.invoice, { session });
    }

    await labWorkModel.findByIdAndDelete(id, { session });

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
