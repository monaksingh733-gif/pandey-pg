import type { TierKey } from "./pricing";

export const BRAND = {
  name: "PANDEY",
  tagline: "LUXURY PG & LIVING",
  phone: "+91 95481 75915",
  phoneRaw: "919548175915",
  whatsapp: "919548175915",
  email: "stay@pandeypg.in",
  address: "Plot 14, Vidya Nagar Extension, Near Main University & Tech Park, Bengaluru 560103",
  mapEmbed:
    "https://www.google.com/maps?q=Vidya+Nagar+Extension+Bengaluru&output=embed",
  upi: "pandeypg@okhdfcbank",
};

export const waLink = (message: string) =>
  `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message)}`;

export const IMG = {
  hero: "https://images.pexels.com/photos/8092426/pexels-photo-8092426.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1800&h=1100",
  single:
    "https://images.pexels.com/photos/35189671/pexels-photo-35189671.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=850",
  double:
    "https://images.pexels.com/photos/6782578/pexels-photo-6782578.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=850",
  triple:
    "https://images.pexels.com/photos/8135499/pexels-photo-8135499.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=850",
  washroom:
    "https://images.pexels.com/photos/33599113/pexels-photo-33599113.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=900&h=1400",
  dining:
    "https://images.pexels.com/photos/17606660/pexels-photo-17606660.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=900&h=1400",
  lounge:
    "https://images.pexels.com/photos/3144580/pexels-photo-3144580.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=900",
  study:
    "https://images.pexels.com/photos/3887985/pexels-photo-3887985.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=900",
};

export interface RoomSpec {
  tier: TierKey;
  title: string;
  eyebrow: string;
  seats: string;
  blurb: string;
  suitedFor: string;
  image: string;
  badge: string;
  badgeTone: "gold" | "green" | "amber";
  size: string;
  highlights: string[];
  specs: { label: string; value: string }[];
  includes: string[];
}

export const ROOMS: RoomSpec[] = [
  {
    tier: "single",
    title: "Superior Single Suite",
    eyebrow: "01 — Private Occupancy",
    seats: "1-Seater",
    blurb:
      "A private room with attached washroom, balcony, dedicated study desk, ergonomic chair, full-size wardrobe and high-speed Wi-Fi.",
    suitedFor:
      "Best suited for working professionals and post-graduate students who need absolute privacy, quiet focus hours and a hotel-grade personal space.",
    image: IMG.single,
    badge: "Most Popular",
    badgeTone: "gold",
    size: "145 sq.ft · Private washroom · Balcony",
    highlights: [
      "King-size bed with orthopaedic mattress",
      "Private attached washroom + geyser",
      "Personal balcony & blackout curtains",
      "Ergonomic study chair + LED desk lamp",
    ],
    specs: [
      { label: "Occupancy", value: "1 Resident" },
      { label: "Carpet Area", value: "145 sq.ft" },
      { label: "Washroom", value: "Private Attached" },
      { label: "Cooling", value: "Split AC / Non-AC" },
      { label: "Wardrobe", value: "Full-height, lockable" },
      { label: "Wi-Fi", value: "300 Mbps dual-band" },
    ],
    includes: [
      "Daily housekeeping",
      "Laundry (6 garments / week)",
      "Power backup (AC + lights)",
      "Biometric entry",
    ],
  },
  {
    tier: "double",
    title: "Executive Double Sharing",
    eyebrow: "02 — Twin Sharing",
    seats: "2-Seater",
    blurb:
      "A spacious twin-bed room with two separate study stations, individual locking wardrobes, attached geyser washroom and 3-time meals.",
    suitedFor:
      "Best suited for friends, classmates or colleagues moving in together who want personal study zones without paying single-room rent.",
    image: IMG.double,
    badge: "2 Beds Left",
    badgeTone: "amber",
    size: "190 sq.ft · Attached geyser washroom",
    highlights: [
      "Two single beds, 4 ft apart for privacy",
      "Independent study stations & task lights",
      "Individual locking wardrobes per resident",
      "Attached washroom with 24×7 hot water",
    ],
    specs: [
      { label: "Occupancy", value: "2 Residents" },
      { label: "Carpet Area", value: "190 sq.ft" },
      { label: "Washroom", value: "Attached + Geyser" },
      { label: "Cooling", value: "Split AC / Non-AC" },
      { label: "Meals", value: "Breakfast · Lunch · Dinner" },
      { label: "Wi-Fi", value: "300 Mbps dual-band" },
    ],
    includes: [
      "Alternate-day cleaning",
      "Laundry (6 garments / week)",
      "Full power backup",
      "Shared study lounge access",
    ],
  },
  {
    tier: "triple",
    title: "Grand Triple Sharing",
    eyebrow: "03 — Value Sharing",
    seats: "3-Seater",
    blurb:
      "A comfort-first spacious room for 3 residents with individual bed lamps, charging sockets, separate storage lockers and full mess access.",
    suitedFor:
      "Best suited for coaching aspirants and budget-smart students who want the lowest all-inclusive monthly cost with zero compromises on hygiene.",
    image: IMG.triple,
    badge: "Available",
    badgeTone: "green",
    size: "240 sq.ft · Common washroom + geyser",
    highlights: [
      "Three beds with personal reading lamps",
      "Dedicated charging socket at every bed",
      "Steel storage locker per resident",
      "Unlimited mess access, 7 days a week",
    ],
    specs: [
      { label: "Occupancy", value: "3 Residents" },
      { label: "Carpet Area", value: "240 sq.ft" },
      { label: "Washroom", value: "Common (2 min walk)" },
      { label: "Cooling", value: "AC / Ceiling fan" },
      { label: "Meals", value: "Full mess included" },
      { label: "Wi-Fi", value: "300 Mbps dual-band" },
    ],
    includes: [
      "Weekly deep cleaning",
      "Laundry (4 garments / week)",
      "Power backup (lights & fans)",
      "Study lounge + library access",
    ],
  },
];

export const QUICK_INFO = [
  {
    icon: "clock",
    label: "Check-in / Gate Timings",
    primary: "9:00 AM – 9:00 PM",
    secondary: "24/7 Biometric Access for Residents",
  },
  {
    icon: "map",
    label: "Prime Location",
    primary: "Near Main University & Tech Park",
    secondary: "2 Mins Walk to Main Road",
  },
  {
    icon: "shield",
    label: "Warden & Support",
    primary: "24/7 On-Site Warden",
    secondary: "+91 95481 75915 (Instant WhatsApp)",
  },
];

export const AMENITIES: { icon: string; title: string; note: string }[] = [
  { icon: "wifi", title: "High-Speed Wi-Fi", note: "300 Mbps dual-band fiber, mesh routers on every floor" },
  { icon: "utensils", title: "3-Time Homely Meals", note: "Chef-cooked veg mess menu, rotating weekly plan" },
  { icon: "sparkles", title: "Daily Room Cleaning", note: "Housekeeping every morning, weekly deep clean" },
  { icon: "washing", title: "Automatic Laundry", note: "2 washing machines + dryer, ironing service" },
  { icon: "zap", title: "24/7 Power Backup", note: "Silent inverter backup for lights, fans, Wi-Fi & AC" },
  { icon: "fingerprint", title: "Biometric & CCTV", note: "Fingerprint entry, 32 CCTV cameras, night watchman" },
  { icon: "snowflake", title: "Air Conditioning", note: "Split ACs in single & double rooms, serviced monthly" },
  { icon: "book", title: "Study Lounge", note: "Silent 24-seat library with individual reading lamps" },
];

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const MESS_MENU: Record<DayKey, { breakfast: string; lunch: string; evening: string; dinner: string }> = {
  mon: {
    breakfast: "Aloo Paratha · Curd · Masala Chai",
    lunch: "Dal Tadka · Jeera Rice · Seasonal Veg · Roti · Salad",
    evening: "Vegetable Poha · Filter Coffee",
    dinner: "Paneer Butter Masala · Phulka · Boondi Raita",
  },
  tue: {
    breakfast: "Idli · Sambar · Coconut Chutney",
    lunch: "Rajma Masala · Steamed Rice · Aloo Gobhi · Roti",
    evening: "Bread Pakora · Masala Chai",
    dinner: "Mix Veg Kofta · Phulka · Sweet Dish (Gulab Jamun)",
  },
  wed: {
    breakfast: "Poha · Boiled Egg / Paneer Bhurji · Chai",
    lunch: "Kadhi Pakora · Rice · Bhindi Masala · Roti",
    evening: "Masala Sandwich · Lemon Tea",
    dinner: "Chole · Jeera Rice · Onion Salad · Phulka",
  },
  thu: {
    breakfast: "Upma · Banana · Filter Coffee",
    lunch: "Sambar · Rice · Cabbage Poriyal · Roti · Curd",
    evening: "Maggi Masala · Chai",
    dinner: "Palak Paneer · Phulka · Dal Fry · Sweet Dish",
  },
  fri: {
    breakfast: "Chole Bhature · Pickle · Chai",
    lunch: "Veg Biryani · Mirchi Ka Salan · Raita · Papad",
    evening: "Samosa · Mint Chutney · Masala Chai",
    dinner: "Butter Chicken Style Paneer · Naan · Veg Pulao",
  },
  sat: {
    breakfast: "Masala Dosa · Sambar · Chutney",
    lunch: "Kadai Paneer · Rice · Dal Makhani · Roti",
    evening: "Pav Bhaji · Cold Coffee",
    dinner: "Tawa Veg · Phulka · Gajar Halwa (Sweet Dish)",
  },
  sun: {
    breakfast: "Aloo Kulcha · Curd · Pickle · Chai",
    lunch: "Special Thali — Paneer Tikka · Dal · Rice · Roti · Sweet",
    evening: "Pastries · Fruit Bowl · Tea",
    dinner: "Veg Hakka Noodles · Manchurian · Fried Rice",
  },
};

export const MESS_DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

export const MESS_TIMINGS = [
  { slot: "Breakfast", time: "7:30 – 9:30 AM" },
  { slot: "Lunch", time: "12:30 – 3:00 PM" },
  { slot: "Evening Tea & Snacks", time: "5:30 – 6:30 PM" },
  { slot: "Dinner", time: "8:30 – 10:30 PM" },
];

export const HOUSE_RULES = [
  {
    title: "Lock-in Period — 3 Months",
    body: "A minimum 3-month lock-in applies to every bed. Leaving earlier forfeits one month's rent from the refundable deposit.",
  },
  {
    title: "Notice Period — 30 Days",
    body: "Inform the warden in writing (WhatsApp is acceptable) 30 days before vacating so your deposit clears on time.",
  },
  {
    title: "Security Deposit — 1 Month, Refundable",
    body: "One month's room rent, fully refundable within 15 working days of checkout after deducting pending electricity and damages.",
  },
  {
    title: "Parent & Guest Visits",
    body: "Parents may visit any day between 9 AM – 9 PM. Friends of the same gender allowed in the lounge till 8 PM with prior entry in the visitor register.",
  },
  {
    title: "No Smoking, No Alcohol",
    body: "Zero tolerance for smoking, alcohol, narcotics and loud parties anywhere on the premises. First violation = immediate checkout without deposit refund.",
  },
  {
    title: "Gate & Late Entry",
    body: "Main gate closes at 11:00 PM. Biometric late entry is permitted with an SMS alert to the emergency contact and a register note to the warden.",
  },
];

export const FAQS = [
  {
    q: "When and how is the security deposit refunded?",
    a: "The deposit equals one month of room rent and is 100% refundable. After checkout and a joint room inspection, the amount is transferred to your bank account within 15 working days. Deductions are made only for unpaid electricity, lost keys/access cards, or documented property damage — an itemised statement is shared on WhatsApp before any deduction.",
  },
  {
    q: "Is electricity billed separately? How is the meter reading done?",
    a: "Yes. Each room has an independent sub-meter. On the 1st of every month the warden shares a photo of your meter reading on the resident WhatsApp group, and units are billed at ₹8.50 per unit. A typical single-AC room uses ₹900 – ₹1,400 per month. Water, Wi-Fi, housekeeping, laundry and maintenance are all included in your rent — no separate bills.",
  },
  {
    q: "What are the mess food timings, and can I skip meals?",
    a: "Breakfast 7:30 – 9:30 AM, Lunch 12:30 – 3:00 PM, Evening Tea & Snacks 5:30 – 6:30 PM, Dinner 8:30 – 10:30 PM. You can mark a meal-skip in the resident app before 9 PM the previous night for up to 10 days a month; skipped dinner credits roll into next month's mess bill. The full weekly menu is published every Sunday.",
  },
  {
    q: "What are the late-night entry rules for residents?",
    a: "The main gate closes at 11:00 PM. Residents with biometric access can enter any time up to 1:00 AM — an automated SMS is sent to your registered emergency contact and a note is logged with the night warden. Entry after 1:00 AM requires prior approval from the warden. Non-residents are never permitted inside rooms after 9:00 PM.",
  },
  {
    q: "How does the laundry service work?",
    a: "Two automatic washing machines and a dryer run from 6 AM to 10 PM on a first-come basis, with detergent provided free. If you prefer, our Laundry+ add-on (₹400/month) collects your bag every Monday and Thursday and returns washed-and-ironed clothes within 48 hours. Single and double rooms include 6 garments per week; triple rooms include 4.",
  },
];

export const REVIEWS = [
  {
    name: "Ananya Krishnan",
    initials: "AK",
    role: "Final-year B.Tech, Main University",
    badge: "College Student",
    room: "Executive Double Sharing",
    rating: 5,
    months: "11 months resident",
    quote:
      "I compared nine PGs before choosing PANDEY PG. The mess food is genuinely homely — the Saturday dosa and Sunday thali are why my roommate and I never order in. Wi-Fi never dropped once during my online placement interviews, and the study lounge on the second floor became my exam bunker.",
  },
  {
    name: "Rohit Deshmukh",
    initials: "RD",
    role: "Backend Engineer, Tech Park",
    badge: "Working Professional",
    room: "Superior Single Suite",
    rating: 5,
    months: "8 months resident",
    quote:
      "Zero brokerage was the hook, the AC single suite was the reason I stayed. Biometric entry means I can reach at 11 PM after a release without calling anyone. Electricity is metered and transparent — the warden sends the reading photo every month. My all-in cost is still lower than a 1BHK plus Wi-Fi plus a cook.",
  },
  {
    name: "Sneha & Mr. Agarwal",
    initials: "SA",
    role: "Resident & Parent (Kota → Bengaluru)",
    badge: "Parent Verified",
    room: "Grand Triple Sharing",
    rating: 5,
    months: "14 months resident",
    quote:
      "As a mother I cared about three things: safety, food and whether my daughter actually studies. CCTV in every corridor, a warden who picks up on the first ring, and a fixed 11 PM gate. My daughter's coaching is a 6-minute walk away. The WhatsApp video tour convinced us before we ever paid a rupee.",
  },
];

export const STATS = [
  { value: "4.9/5", label: "Resident Rating", sub: "212 verified reviews" },
  { value: "32", label: "CCTV Cameras", sub: "Every corridor & gate" },
  { value: "300", label: "Mbps Wi-Fi", sub: "Dual-band fiber mesh" },
  { value: "₹0", label: "Brokerage", sub: "Direct owner booking" },
];

export const FLAT_COMPARISON = [
  { label: "Monthly rent (1 BHK / shared flat)", flat: 14000, pg: 0, note: "Covered by PANDEY PG room rent" },
  { label: "Brokerage (one-time, amortised monthly)", flat: 1200, pg: 0, note: "₹0 at PANDEY PG — direct booking" },
  { label: "Wi-Fi + router bill", flat: 900, pg: 0, note: "300 Mbps fiber included" },
  { label: "Society maintenance", flat: 1500, pg: 0, note: "No maintenance charges" },
  { label: "Cook / tiffin service (3 meals)", flat: 5500, pg: 0, note: "Homely mess included" },
  { label: "Housekeeping & laundry", flat: 1800, pg: 0, note: "Daily cleaning included" },
  { label: "Cylinder / electricity surge", flat: 900, pg: 0, note: "Transparent sub-meter only" },
  { label: "Power backup / inverter", flat: 700, pg: 0, note: "24/7 backup included" },
  { label: "Furniture, geyser & appliance CAPEX", flat: 1400, pg: 0, note: "Fully furnished rooms" },
];
