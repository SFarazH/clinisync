import axios from "axios";
import { NextResponse } from "next/server";

export async function POST() {
  const response = await axios({
    url: "https://graph.facebook.com/v22.0/949548331582073/messages",
    method: "post",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: {
      messaging_product: "whatsapp",
      to: "919922765270",
      type: "template",
      template: {
        name: "hello_world",
        language: {
          code: "en_US",
        },
        // components: [
        //   {
        //     type: "header",
        //     parameters: [
        //       {
        //         type: "text",
        //         text: "John Doe",
        //       },
        //     ],
        //   },
        //   {
        //     type: "body",
        //     parameters: [
        //       {
        //         type: "text",
        //         text: "50",
        //       },
        //     ],
        //   },
        // ],
      },
    },
  });

  //   console.log(response);
  console.log(response.data);
  return NextResponse.json({ success: true, data: response.data });
}
