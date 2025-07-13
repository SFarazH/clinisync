import { createOrUpdateAppSettings, getAppSettings } from "@/services";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await getAppSettings();

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: result.data });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await createOrUpdateAppSettings(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/appSettings:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
