import Invoice from "@/models/Invoice";
import { dbConnect } from "@/utils/dbConnect";

export async function addPaymentForInvoice(invoiceId, amount, paymentMethod) {
  // data -> invoiceId, amount
  await dbConnect();

  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    if (invoice.amountPaid + parseInt(amount) > invoice.totalAmount) {
      return { success: false, error: "Payment exceeds total amount" };
    }

    invoice.paymentsHistory.push({
      amount: parseInt(amount),
      method: paymentMethod || "cash",
      date: new Date(),
    });
    if (invoice.amountPaid + parseInt(amount) == invoice.totalAmount) {
      invoice.isPaymentComplete = true;
    }
    invoice.amountPaid += parseInt(amount);
    await invoice.save();

    return { success: true, data: invoice };
  } catch (error) {
    console.error("Error adding payment:", error);
    return { success: false, error: error.message };
  }
}

export async function getInvoices({
  invoiceType = "appointment" | "labWork",
  patientId = null,
  isPaymentComplete = null,
  paginate,
  page = 1,
  limit = 10,
}) {
  await dbConnect();

  try {
    paginate = paginate === "true" || paginate === true;
    const query = {};
    query.invoiceType = invoiceType;
    if (patientId) {
      query.patientId = patientId;
    }

    if (isPaymentComplete) {
      query.isPaymentComplete = isPaymentComplete;
    }

    let invoiceQuery = Invoice.find(query).populate("patientId", "name");
    if (invoiceType === "labWork") {
      invoiceQuery.populate("labWork", "nameOfLab work  ");
    }
    let total;
    if (paginate) {
      invoiceQuery = invoiceQuery.skip((page - 1) * limit).limit(limit);
      total = await Invoice.countDocuments(query);
    }

    const invoiceData = await invoiceQuery;

    const res = { success: true, data: invoiceData };
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
    console.error("Error fetching payments:", error);
    return { success: false, error: error.message };
  }
}

export async function getInvoiceById(invoiceId) {
  dbConnect();
  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    return {
      success: true,
      data: invoice,
    };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteInvocie(id) {
  await dbConnect();

  try {
    const deleted = await Invoice.findByIdAndDelete(id);
    if (!deleted) {
      return { success: false, error: "Invoice not found" };
    }

    return { success: true, data: deleted };
  } catch (error) {
    console.error("Error deleting lab work:", error);
    return { success: false, error: error.message };
  }
}
