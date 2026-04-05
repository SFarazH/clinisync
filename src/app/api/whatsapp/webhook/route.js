import { handleWebhook } from "@/services/whatsapp.services";

export async function POST(req) {
  try {
    const body = await req.json();

    await handleWebhook(body);

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);

    return new Response("OK", { status: 200 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_TOKEN) {
    console.log("Webhook verified!");
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}
