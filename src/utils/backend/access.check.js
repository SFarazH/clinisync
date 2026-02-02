import { NextResponse } from "next/server";

export const checkAccess = (clinic, dbName, featureKey) => {
  if (!clinic) {
    return NextResponse.json(
      { success: false, error: "Clinic information missing" },
      { status: 400 },
    );
  }
  console.log(clinic.databaseName, dbName);

  if (dbName !== "clinisync") {
    if (clinic.databaseName !== dbName) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 },
      );
    }
  }

  if (featureKey && !clinic.features[featureKey]) {
    return NextResponse.json(
      {
        success: false,
        error: `Feature not enabled for this clinic`,
      },
      { status: 403 },
    );
  }
  return null;
};
