import { createWaLink, WARDEN_PHONE, WhatsAppTemplates } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const { type, payload } = body;
  if (!type || !payload) {
    return Response.json({ ok: false, error: "Type and payload required." }, { status: 400 });
  }

  let text = "";
  let targetPhone = "";

  switch (type) {
    case "booking_resident":
      text = WhatsAppTemplates.bookingWelcomeToResident(payload);
      targetPhone = payload.mobile || "";
      break;

    case "booking_warden":
      text = WhatsAppTemplates.bookingAlertToWarden(payload);
      targetPhone = WARDEN_PHONE;
      break;

    case "maintenance_warden":
      text = WhatsAppTemplates.maintenanceAlertToWarden(payload);
      targetPhone = WARDEN_PHONE;
      break;

    case "gatepass_warden":
      text = WhatsAppTemplates.gatePassAlertToWarden(payload);
      targetPhone = WARDEN_PHONE;
      break;

    case "rent_reminder":
      text = WhatsAppTemplates.rentReminderToResident(payload);
      targetPhone = payload.mobile || "";
      break;

    default:
      return Response.json({ ok: false, error: "Unknown notification type." }, { status: 400 });
  }

  const waLink = createWaLink(targetPhone || WARDEN_PHONE, text);

  // Optional Meta WhatsApp Cloud API dispatch if token is provided
  const metaToken = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  let cloudApiSent = false;
  if (metaToken && phoneNumberId && targetPhone) {
    try {
      const cleanPhone = targetPhone.replace(/\D/g, "");
      const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

      const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${metaToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: fullPhone,
          type: "text",
          text: { body: text },
        }),
      });
      const data = await res.json();
      cloudApiSent = res.ok && Boolean(data.messages);
    } catch (err) {
      console.error("[WhatsApp Cloud API error]", err);
    }
  }

  return Response.json({
    ok: true,
    cloudApiSent,
    waLink,
    messageText: text,
    recipient: targetPhone || WARDEN_PHONE,
  });
}
