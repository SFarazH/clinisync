import Appointment from "@/models/Appointment";
import { dbConnect } from "@/utils/dbConnect";
import mongoose from "mongoose";

// add appointment
export async function createAppointment(data) {
  await dbConnect();
  try {
    const appointment = await Appointment.create(data);
    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return { success: false, error: error.message };
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
      .sort({ date: 1, startTime: 1 });

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
    if (!appointment) {
      return { success: false, error: "Appointment not found" };
    }
    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return { success: false, error: error.message };
  }
}
