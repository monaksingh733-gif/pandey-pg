export interface DayMenu {
  day: string;
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
  special: string;
}

export const WEEKLY_MESS_MENU: Record<number, DayMenu> = {
  0: {
    day: "Sunday",
    breakfast: "Aloo Poha / Masala Omelette + Boiled Eggs + Fresh Papaya + Tea / Coffee",
    lunch: "Special Feast Thali: Paneer Butter Masala, Dal Makhani, Jeera Pulao, Butter Naan, Gulab Jamun",
    snacks: "Veg Cutlet / Samosa + Adrak Chai",
    dinner: "Veg Biryani / Dum Pulao with Mixed Raita, Dal Tadka & Salad",
    special: "Sunday Special Sweet & Naan Feast",
  },
  1: {
    day: "Monday",
    breakfast: "Hot Idli & Crispy Vada with Coconut Chutney & Tomato Sambhar + Tea / Coffee",
    lunch: "Rajma Masala (Punjabi Style), Steamed Basmati Rice, Aloo Gobhi, Phulkas, Curd & Salad",
    snacks: "Poha / Biscuit + Hot Chai",
    dinner: "Mix Veg Sabzi, Yellow Moong Dal Fry, Fresh Tawa Roti, Steamed Rice & Kheer",
    special: "Homely Comfort Meal",
  },
  2: {
    day: "Tuesday",
    breakfast: "Stuffed Aloo Paratha with Butter, Curd & Pickle + Ginger Tea / Coffee",
    lunch: "Chole Bhature / Chole Kulche, Jeera Rice, Boondi Raita, Onion-Lemon Salad",
    snacks: "Sweet Corn Chaat + Masala Tea",
    dinner: "Sev Tamatar / Dum Aloo, Arhar Dal Tadka, Soft Phulkas, Steamed Rice",
    special: "Delhi Style Chole Day",
  },
  3: {
    day: "Wednesday",
    breakfast: "Mysore Masala Dosa / Plain Dosa with Potato Masala & Dual Chutneys + Tea / Coffee",
    lunch: "Kadhi Pakora, Steamed Rice, Bhindi Do Pyaza, Phulkas, Papad & Pickle",
    snacks: "Bread Pakora / Veg Roll + Filter Coffee",
    dinner: "Matar Paneer, Chana Dal Fry, Warm Phulkas, Steamed Rice & Suji Halwa",
    special: "Matar Paneer Night",
  },
  4: {
    day: "Thursday",
    breakfast: "Poori Bhaji (Spicy Aloo Tamatar Curry) + Halwa + Tea / Coffee",
    lunch: "Dal Fry, Seasonal Veg Korma, Steamed Basmati Rice, Phulkas, Fresh Curd",
    snacks: "Mix Veg Pakora + Cutting Chai",
    dinner: "Malai Kofta, Mix Dal, Tawa Paratha, Steamed Rice, Green Salad",
    special: "Royal Kofta Dinner",
  },
  5: {
    day: "Friday",
    breakfast: "Poha with Roasted Peanuts & Sev + Upma + Coconut Chutney + Tea / Coffee",
    lunch: "Dal Tadka, Aloo Shimla Mirch, Steamed Rice, Phulkas, Chaas (Buttermilk)",
    snacks: "Maggi / Bhel Puri + Lemon Tea",
    dinner: "Palak Paneer / Veg Jalfrezi, Kali Dal, Jeera Rice, Soft Rotis, Jalebi",
    special: "Weekend Warmup Special",
  },
  6: {
    day: "Saturday",
    breakfast: "Uttapam (Onion & Tomato) with Chutney & Sambar + Tea / Coffee",
    lunch: "Dal Khichdi / Veg Biryani with Tadka Curd, Baingan Bharta, Papad, Phulkas",
    snacks: "Pav Bhaji (Butter Toasted Pav) + Hot Chai",
    dinner: "Paneer Bhurji / Soya Chaap Gravy, Dal Makhani, Rumali Roti, Pulao, Ice Cream",
    special: "Chef's Special Saturday",
  },
};

export function getTodayMenu(): DayMenu {
  const dayIndex = new Date().getDay();
  return WEEKLY_MESS_MENU[dayIndex] || WEEKLY_MESS_MENU[1];
}
