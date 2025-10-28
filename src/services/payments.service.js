import Payment from "@/models/Invoice";
import { dbConnect } from "@/utils/dbConnect";

export async function addPayment(data) {
  await dbConnect();

  try {
    const payment = await Payment.create(data);
    return { success: true, data: payment };
  } catch (error) {
    console.error("Error adding payment:", error);
    return { success: false, error: error.message };
  }
}

export async function getPayments({
  transactionType = "income" | "expense",
  patientId = null,
  isPaymentComplete = null,
  paginate = true,
  page = 1,
  limit = 10,
}) {
  await dbConnect();

  try {
    const query = {};
    query.transactionType = transactionType;
    if (patientId) {
      query.patientId = patientId;
    }

    if (isPaymentComplete) {
      query.isPaymentComplete = isPaymentComplete;
    }

    let paymentsQuery = Payment.find(query).populate("patientId", "name");
    let total;
    if (paginate) {
      paymentsQuery = paymentsQuery.skip((page - 1) * limit).limit(limit);
      total = await Payment.countDocuments(query);
    }

    const paymentData = await paymentsQuery;

    const res = { success: true, data: paymentData };
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
