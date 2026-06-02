import { NextResponse } from "next/server";

type LeadPayload = {
  name?: string;
  phone?: string;
  service?: string;
  master?: string;
  bookingDate?: string;
  bookingTime?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendLeadToCrm(payload: {
  client: string;
  phone: string;
  service: string;
  budget: number;
  comment: string;
}) {
  const crmUrl = process.env.CRM_WEBHOOK_URL;

  if (!crmUrl) return;

  await fetch(crmUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.CRM_WEBHOOK_SECRET ? { "x-crm-secret": process.env.CRM_WEBHOOK_SECRET } : {}),
    },
    body: JSON.stringify({
      ...payload,
      project: "NordCut",
    }),
  }).catch(() => null);
}

function getServiceBudget(service: string) {
  const price = service.match(/\d[\d\s]*/)?.[0]?.replace(/\D/g, "");

  return price ? Number(price) : 0;
}

export async function POST(request: Request) {
  const payload = (await request.json()) as LeadPayload;
  const name = payload.name?.trim() ?? "";
  const phone = payload.phone?.trim() ?? "";
  const service = payload.service?.trim() ?? "";
  const master = payload.master?.trim() ?? "Любой мастер";
  const bookingDate = payload.bookingDate?.trim() ?? "";
  const bookingTime = payload.bookingTime?.trim() ?? "";
  const phoneDigits = phone.replace(/\D/g, "");

  if (!name || phoneDigits.length !== 11 || !service || !bookingDate || !bookingTime) {
    return NextResponse.json({ message: "Invalid lead data" }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json({ message: "Telegram is not configured" }, { status: 500 });
  }

  const submittedAt = new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(new Date());

  const text = [
    "<b>Новая заявка с сайта NordCut</b>",
    "",
    `<b>Имя:</b> ${escapeHtml(name)}`,
    `<b>Телефон:</b> ${escapeHtml(phone)}`,
    `<b>Услуга:</b> ${escapeHtml(service)}`,
    `<b>Мастер:</b> ${escapeHtml(master)}`,
    `<b>Желаемая дата:</b> ${escapeHtml(bookingDate)}`,
    `<b>Желаемое время:</b> ${escapeHtml(bookingTime)}`,
    `<b>Заявка создана:</b> ${escapeHtml(submittedAt)}`,
  ].join("\n");

  const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      parse_mode: "HTML",
      text,
    }),
  });

  if (!telegramResponse.ok) {
    return NextResponse.json({ message: "Telegram request failed" }, { status: 502 });
  }

  await sendLeadToCrm({
    client: name,
    phone,
    service,
    budget: getServiceBudget(service),
    comment: `Мастер: ${master}. Дата: ${bookingDate}. Время: ${bookingTime}.`,
  });

  return NextResponse.json({ ok: true });
}
