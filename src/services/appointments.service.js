import Appointment from "@/models/Appointment";
import Invoice from "@/models/Invoice";
import Prescription from "@/models/Prescription";
import Procedure from "@/models/Procedure";
import mongoose from "mongoose";

// add appointment
export async function createAppointment(data, dbName) {
  const appointmentsModel = await getMongooseModel(
    dbName,
    "Appointment",
    Appointment.schema
  );

  const proceduresModel = await getMongooseModel(
    dbName,
    "Procedure",
    Procedure.schema
  );

  const invoicesModel = await getMongooseModel(
    dbName,
    "Invoice",
    Invoice.schema
  );

  const session = await appointmentsModel.startSession();
  session.startTransaction();

  try {
    const procedure = await proceduresModel
      .findById(data.procedureId)
      .session(session);
    if (!procedure) {
      return { success: false, message: "Procedure not found" };
    }

    const totalAmount = procedure.cost;

    const appointment = await appointmentsModel.create(
      [
        {
          ...data,
        },
      ],
      { session }
    );

    const invoice = await invoicesModel.create(
      [
        {
          invoiceType: "appointment",
          transactionType: "income",
          patientId: data.patientId,
          appointment: appointment[0]._id,
          totalAmount: totalAmount,
          amountPaid: 0,
          isPaymentComplete: false,
          appointmentDate: appointment[0].date,
        },
      ],
      { session }
    );

    appointment[0].invoice = invoice[0]._id;
    await appointment[0].save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      data: { appointment: appointment[0], invoice: invoice[0] },
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating appointment/invoice:", err);
    return { success: false, message: err };
  }
}

// list appointments
export async function listAppointments({
  page = 1,
  limit = 10,
  doctorId = null,
  startDate = null,
  endDate = null,
  paginate,
  status = null,
  dbName,
}) {
  const appointmentsModel = await getMongooseModel(
    dbName,
    "Appointment",
    Appointment.schema
  );
  try {
    const query = {};

    if (doctorId) {
      query.doctorId = doctorId;
    }

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }

    let appointmentsQuery = appointmentsModel
      .find(query)
      .populate("patientId", "name")
      .populate("doctorId", "name color")
      .populate("procedureId", "name duration color abbr")
      .populate("prescription")
      .sort(paginate ? { date: -1 } : { date: 1, startTime: 1 });

    let total = await appointmentsModel.countDocuments(query);

    if (paginate) {
      appointmentsQuery = appointmentsQuery
        .skip((page - 1) * limit)
        .limit(limit);
    }

    const appointments = await appointmentsQuery;
    const res = {
      success: true,
      data: appointments,
      total: total,
      pagination: paginate
        ? {
            page,
            pages: Math.ceil(total / limit),
            limit,
          }
        : null,
    };
    return res;
  } catch (error) {
    console.error("Error listing appointments:", error);
    return { success: false, error: error.message };
  }
}

// get appointment by id
export async function getAppointmentById(id, dbName) {
  const appointmentsModel = await getMongooseModel(
    dbName,
    "Appointment",
    Appointment.schema
  );

  try {
    const appointment = await appointmentsModel
      .findById(id)
      .populate("patient doctorId procedureId");
    if (!appointment) {
      return { success: false, error: "Appointment not found" };
    }
    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error fetching appointment by ID:", error);
    return { success: false, error: error.message };
  }
}

// update appointment
export async function updateAppointment(id, data, dbName) {
  const appointmentsModel = await getMongooseModel(
    dbName,
    "Appointment",
    Appointment.schema
  );

  const invoicesModel = await getMongooseModel(
    dbName,
    "Invoice",
    Invoice.schema
  );

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const appointment = await appointmentsModel
      .findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
        session,
      })
      .populate("patientId", "name")
      .populate("doctorId", "name")
      .populate("procedureId", "name duration color abbr cost");

    if (!appointment) {
      await session.abortTransaction();
      session.endSession();
      return { success: false, error: "Appointment not found" };
    }

    const procedureCost = appointment.procedureId?.cost;
    const existingInvoice = await invoicesModel
      .findById(appointment.invoice)
      .session(session);

    if (existingInvoice) {
      const isPending = procedureCost > existingInvoice.amountPaid;

      const updatedInvoice = await invoicesModel.findByIdAndUpdate(
        appointment.invoice,
        {
          totalAmount: procedureCost,
          isPaymentComplete: !isPending,
          appointmentDate: appointment.date,
        },
        { new: true, session }
      );

      if (!updatedInvoice) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: "Invoice not found" };
      }
    }
    await session.commitTransaction();
    session.endSession();

    return { success: true, data: appointment };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating appointment:", error);
    return { success: false, error: error.message };
  }
}

// delete appointment
export async function deleteAppointment(id, dbName) {
  const appointmentsModel = await getMongooseModel(
    dbName,
    "Appointment",
    Appointment.schema
  );

  const invoicesModel = await getMongooseModel(
    dbName,
    "Invoice",
    Invoice.schema
  );

  const prescriptionsModel = await getMongooseModel(
    dbName,
    "Prescription",
    Prescription.schema
  );

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appointment = await appointmentsModel.findById(id).session(session);

    if (!appointment) {
      await session.abortTransaction();
      session.endSession();
      return { success: false, error: "Appointment not found" };
    }

    if (appointment.invoice) {
      await invociesModel.findByIdAndDelete(appointment.invoice, { session });
    }

    if (appointment.prescription) {
      await prescriptionsModel.findOneAndDelete(
        { appointment: id },
        { session }
      );
    }

    await appointmentsModel.findByIdAndDelete(id, { session });
    await session.commitTransaction();
    session.endSession();

    return { success: true, data: appointment };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting appointment:", error);
    return { success: false, error: error.message };
  }
}
