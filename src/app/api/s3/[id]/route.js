import { getS3Image } from "@/services";
import { NextResponse } from "next/server";

export async function GET(_, { params }) {
  const { id: key } = await params;

  if (!key) {
    return NextResponse.json(
      { error: "No key provided" },
      {
        status: 400,
      }
    );
  }

  const { bufferResponse, contentType } = await getS3Image(key);
  try {
    return new NextResponse(new Uint8Array(bufferResponse), {
      status: 200,
      headers: {
        "Content-Type": contentType || "application/octet-stream",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "File not found" },
      {
        status: 404,
      }
    );
  }
}
