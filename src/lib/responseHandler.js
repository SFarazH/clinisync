import { NextResponse } from "next/server";

export const responseHandler = {
  success(data = null, message = "Success", meta = {}, status = 200) {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
        meta,
        error: null,
      },
      { status },
    );
  },

  error(
    message = "Something went wrong",
    status = 500,
    error = null,
    data = null,
  ) {
    return NextResponse.json(
      {
        success: false,
        message,
        data,
        meta: null,
        error,
      },
      { status },
    );
  },
};