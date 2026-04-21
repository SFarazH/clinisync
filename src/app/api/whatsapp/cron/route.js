import { whatsappCron } from "@/services";
import { responseHandler } from "@/utils";

export async function GET(req) {
  const cronKey = req.headers.get("cron-key");
  console.log(cronKey);
  console.log(process.env.WA_CRON_KEY);

  console.log(typeof cronKey);
  console.log(typeof process.env.WA_CRON_KEY);

  if (!cronKey || cronKey !== process.env.WA_CRON_KEY) {
    return responseHandler.error("Unauthorized Access", 403);
  }

  try {
    console.log("🔁 Cron job started");
    const result = await whatsappCron();

    if (!result.success) {
      return responseHandler.error(result.error, 500);
    }

    return responseHandler.success(result.data, "Cron executed successfully");
  } catch (error) {
    console.error("❌ Cron error:", error);

    return responseHandler.error(
      error.message || "Internal Server Error",
      500,
      error,
    );
  }
}
