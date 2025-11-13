import AppSettings from "@/models/AppSettings";
import { getMongooseModel } from "@/utils/dbConnect";

export async function createOrUpdateAppSettings(data, dbName) {
  const appSettingsModel = await getMongooseModel(
    dbName,
    "AppSettings",
    AppSettings.schema
  );

  try {
    let settings = await appSettingsModel.findOne();

    if (settings) {
      settings = await appSettingsModel.findOneAndUpdate({}, data, {
        new: true,
        runValidators: true,
      });
      return {
        success: true,
        data: settings,
        message: "Updated clinic settings",
      };
    } else {
      settings = await appSettingsModel.create(data);
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

export async function getAppSettings(dbName) {
  const appSettingsModel = await getMongooseModel(
    dbName,
    "AppSettings",
    AppSettings.schema
  );

  try {
    const settings = await appSettingsModel.findOne();
    if (!settings) {
      return { success: false, error: "App settings not found" };
    }

    return { success: true, data: settings };
  } catch (error) {
    console.error("Error getting app settings:", error);
    return { success: false, error: error.message };
  }
}
