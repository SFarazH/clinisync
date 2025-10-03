import Payment from "@/models/Payment";
import { dbConnect } from "@/utils/dbConnect";

export async function addPayment(data) {
  await dbConnect();

  try {
    const payment = await Payment.create(data);
    return { success: true, data: payment };
  } catch (error) {
    console.error("Error creating payment:", error);
    return { success: false, error: error.message };
  }
}
