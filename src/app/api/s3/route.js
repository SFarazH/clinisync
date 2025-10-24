import { s3Upload } from "@/services";
import { NextResponse } from "next/server";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");
  const res = await s3Upload(file);
  return NextResponse.json({ message: "ok", data: res });
}
