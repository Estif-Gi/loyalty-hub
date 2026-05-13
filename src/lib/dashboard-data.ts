export type RewardTier = {
  id: string;
  scans: number;
  reward: string;
};

export type Customer = {
  id: string;
  name: string;
  scans: number;
  rewardsEarned: number;
  lastVisit: string;
};

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image?: string;
};

export type Activity = {
  id: string;
  customer: string;
  action: string;
  time: string;
};

export const stats = {
  totalCustomers: 1284,
  scansToday: 87,
  scansThisWeek: 542,
  rewardsRedeemed: 213,
  loyaltyProgress: 68,
};

export const rewardTiers: RewardTier[] = [
  { id: "1", scans: 5, reward: "10% discount on next order" },
  { id: "2", scans: 10, reward: "Free signature drink" },
  { id: "3", scans: 15, reward: "Free meal of choice" },
  { id: "4", scans: 25, reward: "VIP table reservation + dessert" },
];

export const customers: Customer[] = [
  { id: "C-1024", name: "Amara Okafor", scans: 18, rewardsEarned: 3, lastVisit: "2h ago" },
  { id: "C-1025", name: "Liam Thompson", scans: 12, rewardsEarned: 2, lastVisit: "5h ago" },
  { id: "C-1026", name: "Sofia Martinez", scans: 24, rewardsEarned: 4, lastVisit: "1d ago" },
  { id: "C-1027", name: "Anonymous", scans: 3, rewardsEarned: 0, lastVisit: "1d ago" },
  { id: "C-1028", name: "Yuki Tanaka", scans: 9, rewardsEarned: 1, lastVisit: "2d ago" },
  { id: "C-1029", name: "Marcus Lee", scans: 6, rewardsEarned: 1, lastVisit: "3d ago" },
  { id: "C-1030", name: "Priya Sharma", scans: 31, rewardsEarned: 5, lastVisit: "3d ago" },
  { id: "C-1031", name: "Anonymous", scans: 2, rewardsEarned: 0, lastVisit: "4d ago" },
  { id: "C-1032", name: "Elena Rossi", scans: 14, rewardsEarned: 2, lastVisit: "5d ago" },
  { id: "C-1033", name: "Jamal Brooks", scans: 7, rewardsEarned: 1, lastVisit: "6d ago" },
];

export const activity: Activity[] = [
  {
    id: "a1",
    customer: "Amara Okafor",
    action: "Scanned loyalty QR · +1 stamp",
    time: "2 min ago",
  },
  {
    id: "a2",
    customer: "Liam Thompson",
    action: "Redeemed reward: Free drink",
    time: "18 min ago",
  },
  { id: "a3", customer: "Anonymous", action: "Viewed digital menu", time: "32 min ago" },
  { id: "a4", customer: "Sofia Martinez", action: "Reached tier: Free meal 🎉", time: "1h ago" },
  { id: "a5", customer: "Yuki Tanaka", action: "Scanned loyalty QR · +1 stamp", time: "2h ago" },
  { id: "a6", customer: "Marcus Lee", action: "Scanned loyalty QR · +1 stamp", time: "3h ago" },
];

export const menuItems: MenuItem[] = [
  {
    id: "m1",
    name: "Truffle Mushroom Risotto",
    price: 18.5,
    category: "Mains",
    description: "Creamy arborio rice with wild mushrooms and shaved truffle.",
  },
  {
    id: "m2",
    name: "Wood-fired Margherita",
    price: 14.0,
    category: "Mains",
    description: "San Marzano tomato, fior di latte, fresh basil.",
  },
  {
    id: "m3",
    name: "Burrata & Heirloom Tomato",
    price: 12.0,
    category: "Starters",
    description: "Creamy burrata with garden tomatoes and basil oil.",
  },
  {
    id: "m4",
    name: "Charred Octopus",
    price: 16.5,
    category: "Starters",
    description: "Smoky octopus with romesco and crispy potatoes.",
  },
  {
    id: "m5",
    name: "Tiramisu Classico",
    price: 9.0,
    category: "Desserts",
    description: "Espresso-soaked ladyfingers, mascarpone cream, cocoa.",
  },
  {
    id: "m6",
    name: "Spiced Hot Chocolate",
    price: 5.5,
    category: "Drinks",
    description: "Dark chocolate with cinnamon and a hint of chili.",
  },
];
