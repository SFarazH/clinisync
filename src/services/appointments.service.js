import Appointment from "@/models/Appointment";
import Invoice from "@/models/Invoice";
import Prescription from "@/models/Prescription";
import Procedure from "@/models/Procedure";
import { dbConnect } from "@/utils/dbConnect";

// add appointment
export async function createAppointment(data) {
  await dbConnect();
  const session = await Appointment.startSession();
  session.startTransaction();

  try {
    const procedure = await Procedure.findById(data.procedureId).session(
      session
    );
    if (!procedure) {
      return { success: false, message: "Procedure not found" };
    }

    console.log(procedure);

    const totalAmount = procedure.cost;

    const appointment = await Appointment.create(
      [
        {
          ...data,
        },
      ],
      { session }
    );

    const invoice = await Invoice.create(
      [
        {
          paymentPurpose: "appointment",
          invoiceType: "income",
          patient: data.patientId,
          appointment: appointment[0]._id,
          totalAmount: totalAmount,
          amountPaid: 0,
          isPaymentComplete: false,
        },
      ],
      { session }
    );

    appointment[0].invoiceId = invoice[0]._id;
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
} = {}) {
  await dbConnect();
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

    let appointmentsQuery = Appointment.find(query)
      .populate("patientId", "name")
      .populate("doctorId", "name color")
      .populate("procedureId", "name duration color abbr")
      .populate("prescription")
      .sort(paginate ? { date: -1 } : { date: 1, startTime: 1 });

    let total = await Appointment.countDocuments(query);

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
export async function getAppointmentById(id) {
  await dbConnect();
  try {
    const appointment = await Appointment.findById(id).populate(
      "patient doctorId procedureId"
    );
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
export async function updateAppointment(id, data) {
  await dbConnect();
  try {
    const appointment = await Appointment.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate("patientId", "name")
      .populate("doctorId", "name")
      .populate("procedureId", "name duration color abbr");

    if (!appointment) {
      return { success: false, error: "Appointment not found" };
    }
    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error updating appointment:", error);
    return { success: false, error: error.message };
  }
}

// delete appointment
export async function deleteAppointment(id) {
  await dbConnect();
  try {
    const appointment = await Appointment.findByIdAndDelete(id);
    await Prescription.findOneAndDelete({ appointment: id });
    if (!appointment) {
      return { success: false, error: "Appointment not found" };
    }
    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return { success: false, error: error.message };
  }
}
