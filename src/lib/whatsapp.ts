import { BRAND } from "./data";
import { inr } from "./pricing";

export const WARDEN_PHONE = BRAND.phoneRaw; // 919548175915

export function createWaLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

export const WhatsAppTemplates = {
  // 1. Instant Welcome & Booking Pass sent to Resident
  bookingWelcomeToResident(booking: {
    code: string;
    fullName: string;
    roomCode?: string | null;
    bedLabel?: string | null;
    tier?: string;
    cooling?: string;
    tierLabel?: string;
    coolingLabel?: string;
    moveInDate: string;
    amountPaid: number;
    balanceDue: number;
  }) {
    const tierName = booking.tierLabel || booking.tier || "Sharing";
    const coolingName = booking.coolingLabel || booking.cooling || "AC";
    return [
      `🎉 *WELCOME TO PANDEY PG & LIVING!*`,
      ``,
      `Dear ${booking.fullName},`,
      `Your bed reservation is officially confirmed and locked in our resident directory!`,
      ``,
      `📋 *Booking Details:*`,
      `• *Pass Code:* ${booking.code}`,
      `• *Allocated Bed:* ${booking.bedLabel || "Assigned Bed"} (${tierName}, ${coolingName})`,
      `• *Room Number:* ${booking.roomCode ? `Room ${booking.roomCode}` : "Ground/1st Floor"}`,
      `• *Move-In Date:* ${booking.moveInDate}`,
      `• *Advance Token Paid:* ${inr(booking.amountPaid)}`,
      `• *Balance on Move-In:* ${inr(booking.balanceDue)}`,
      ``,
      `🔑 *Move-In Day Instructions:*`,
      `1. Check-in runs 9:00 AM – 9:00 PM.`,
      `2. Bring your original ID for physical biometric card activation.`,
      `3. Wi-Fi (300 Mbps) & mess meals start immediately upon check-in.`,
      ``,
      `📱 *Resident Self-Service Portal:*`,
      `View daily mess menu, raise tickets & request late gate passes here:`,
      `https://pandeypg.in/resident?code=${encodeURIComponent(booking.code)}`,
      ``,
      `📍 *Google Maps Location:*`,
      `${BRAND.address}`,
      ``,
      `Warden Helpline (24/7): ${BRAND.phone}`,
      `We look forward to welcoming you home!`,
    ].join("\n");
  },

  // 2. Instant Alert sent to Warden (+91 95481 75915)
  bookingAlertToWarden(booking: {
    code: string;
    fullName: string;
    mobile: string;
    emergencyName?: string;
    emergencyPhone?: string;
    roomCode?: string | null;
    bedLabel?: string | null;
    tier?: string;
    cooling?: string;
    floor?: string;
    tierLabel?: string;
    coolingLabel?: string;
    floorLabel?: string;
    moveInDate: string;
    amountPaid: number;
    balanceDue: number;
    category?: string;
  }) {
    const tierName = booking.tierLabel || booking.tier || "Sharing";
    const coolingName = booking.coolingLabel || booking.cooling || "AC";
    const floorName = booking.floorLabel || booking.floor || "1st Floor";
    return [
      `🚨 *NEW RESIDENT BED BOOKED — PANDEY PG*`,
      ``,
      `A new resident has reserved a bed online:`,
      ``,
      `👤 *Resident:* ${booking.fullName}`,
      `📞 *Mobile:* +91 ${booking.mobile}`,
      `🛏️ *Bed:* ${booking.bedLabel} · Room ${booking.roomCode || "TBD"} (${tierName}, ${coolingName}, ${floorName})`,
      `📅 *Move-In Date:* ${booking.moveInDate}`,
      `💰 *Advance Paid:* ${inr(booking.amountPaid)} (Balance: ${inr(booking.balanceDue)})`,
      booking.emergencyName ? `👨‍👩‍👦 *Parent Contact:* ${booking.emergencyName} (+91 ${booking.emergencyPhone || ""})` : "",
      `💼 *Category:* ${booking.category || "Student / Working Professional"}`,
      ``,
      `*Pass Code:* ${booking.code}`,
      `Manage in Warden Console: https://pandeypg.in/admin`,
    ].filter(Boolean).join("\n");
  },

  // 3. Maintenance Ticket Alert to Warden
  maintenanceAlertToWarden(ticket: {
    ticketId: string;
    residentName: string;
    roomCode: string;
    category: string;
    description: string;
    urgency: string;
  }) {
    return [
      `⚠️ *MAINTENANCE COMPLAINT — Room ${ticket.roomCode}*`,
      `Ticket: ${ticket.ticketId} [${ticket.urgency.toUpperCase()}]`,
      `Resident: ${ticket.residentName}`,
      `Category: ${ticket.category}`,
      `Issue: "${ticket.description}"`,
      ``,
      `Please assign technician / resolve in Warden Console.`,
    ].join("\n");
  },

  // 4. Digital Gate Pass Alert to Warden
  gatePassAlertToWarden(pass: {
    passCode: string;
    residentName: string;
    roomCode: string;
    passType: string;
    reason: string;
    departureTime: string;
    expectedReturn: string;
  }) {
    return [
      `🚪 *DIGITAL GATE PASS — Room ${pass.roomCode}*`,
      `Pass ID: ${pass.passCode}`,
      `Resident: ${pass.residentName}`,
      `Type: ${pass.passType === "late_entry" ? "Late Entry (Past 11 PM)" : "Night Out / Travel"}`,
      `Reason: ${pass.reason}`,
      `Departure: ${pass.departureTime} | Return: ${pass.expectedReturn}`,
    ].join("\n");
  },

  // 5. Monthly Rent Due Reminder to Resident
  rentReminderToResident(resident: {
    fullName: string;
    roomCode: string;
    amount: number;
    month: string;
  }) {
    return [
      `🔔 *PANDEY PG — Monthly Rent Notice (${resident.month})*`,
      ``,
      `Dear ${resident.fullName} (Room ${resident.roomCode}),`,
      `This is a friendly reminder that monthly rent of *${inr(resident.amount)}* is due on the 1st.`,
      ``,
      `Includes: 3-time meals, 300 Mbps Wi-Fi, housekeeping & laundry.`,
      `UPI ID for payment: *${BRAND.upi}*`,
      ``,
      `Please share payment screenshot with Warden (${BRAND.phone}) once done. Thank you!`,
    ].join("\n");
  },

  // 6. Overdue Rent & Utilities Defaulter Recovery Notice
  overdueRentReminderToResident(params: {
    residentName: string;
    roomCode: string;
    month: string;
    baseRent: number;
    electricityUnits: number;
    electricityAmount: number;
    otherCharges?: number;
    totalDue: number;
    amountPaid: number;
    balanceDue: number;
    daysOverdue: number;
    dueDate: string;
  }) {
    return [
      `⚠️ *URGENT: PANDEY PG RENT & UTILITIES OVERDUE NOTICE*`,
      ``,
      `Dear ${params.residentName} (Room ${params.roomCode}),`,
      `Your PG dues for *${params.month}* were scheduled on *${params.dueDate}* and are currently overdue by *${params.daysOverdue} days*.`,
      ``,
      `📊 *Itemized Bill Breakdown:*`,
      `• Base Rent (Meals, Wi-Fi, Laundry): ${inr(params.baseRent)}`,
      params.electricityUnits > 0
        ? `• Electricity Sub-Meter (${params.electricityUnits} units @ ₹8.50): ${inr(params.electricityAmount)}`
        : `• Electricity Sub-Meter: Nil`,
      params.otherCharges ? `• Other Charges: ${inr(params.otherCharges)}` : "",
      `• Total Invoice: ${inr(params.totalDue)}`,
      params.amountPaid > 0 ? `• Advance / Partial Paid: ${inr(params.amountPaid)}` : "",
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `🔴 *Net Balance Overdue: ${inr(params.balanceDue)}*`,
      ``,
      `💳 *Instant Payment Options:*`,
      `• Google Pay / PhonePe / Paytm UPI: *${BRAND.upi}*`,
      `• Or pay Cash directly at Warden Office (Ground Floor)`,
      ``,
      `Kindly clear the balance today to avoid late administrative surcharges or mess disruption. If already paid, please share the transaction receipt here.`,
      ``,
      `Warden Contact: ${BRAND.phone}`,
      `PANDEY PG Management`,
    ]
      .filter(Boolean)
      .join("\n");
  },
};
