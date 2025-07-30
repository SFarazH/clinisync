import AppSettings from "@/models/AppSettings";
import { dbConnect } from "@/utils/dbConnect";

export async function createOrUpdateAppSettings(data) {
  await dbConnect();

  try {
    let settings = await AppSettings.findOne();

    if (settings) {
      settings = await AppSettings.findOneAndUpdate({}, data, {
        new: true,
        runValidators: true,
      });
      return {
        success: true,
        data: settings,
        message: "Updated clinic settings",
      };
    } else {
      settings = await AppSettings.create(data);
      return {
        success: true,
        data: settings,
        message: "Initialized clinic settings",
      };
    }
  } catch (error) {
    console.error("Error in createOrUpdateAppSettings:", error);
    return { success: false, error: error.message };
  }
}

export async function getAppSettings() {
  await dbConnect();

  try {
    const settings = await AppSettings.findOne();
    if (!settings) {
      return { success: false, error: "App settings not found" };
    }

    return { success: true, data: settings };
  } catch (error) {
    console.error("Error getting app settings:", error);
    return { success: false, error: error.message };
  }
}
