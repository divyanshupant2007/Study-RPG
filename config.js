const GAME_CONFIG = {
  // XP = 10 XP per 10 minutes (1 XP per minute)
  // Bonus = 20% for > 25 mins
  calculateXP: (minutes) => {
    let base = minutes;
    if (minutes >= 25) {
      base = Math.floor(base * 1.2);
    }
    return base;
  },

  // Leveling up: e.g. 50 XP per level, increasing
  getLevelRequirement: (level) => {
    return Math.floor(50 * Math.pow(1.5, level - 1));
  },
  
  getLevelTitle: (level) => {
    const titles = [
      "Ledger Novice",
      "Trial Balance Trainee",
      "Costing Champion",
      "Taxation Tactician",
      "Audit Master",
      "CA Finalist",
      "Chartered Conqueror"
    ];
    return titles[Math.min(level - 1, titles.length - 1)];
  },

  defaultSubjects: [
    { id: 1, name: "Accounting", xp: 0, level: 1, color: "#ff007f", icon: "book" },
    { id: 2, name: "Business Laws", xp: 0, level: 1, color: "#00f0ff", icon: "gavel" },
    { id: 3, name: "Quantitative Aptitude", xp: 0, level: 1, color: "#ffea00", icon: "calculator" },
    { id: 4, name: "Business Economics", xp: 0, level: 1, color: "#00ff66", icon: "trending-up" }
  ],

  lootPool: [
    { id: 1, name: "Golden Calculator", desc: "A charm for quick math", type: "item", rarity: "rare", icon: "calculator" },
    { id: 2, name: "Tax Code Tome", desc: "Heavy but informative", type: "item", rarity: "common", icon: "book-open" },
    { id: 3, name: "Midnight Coffee", desc: "Fuel for late sessions", type: "consumable", rarity: "common", icon: "coffee" },
    { id: 4, name: "Audit Stamp", desc: "Approved!", type: "item", rarity: "epic", icon: "check-circle" },
    { id: 5, name: "Motivation Badge", desc: "Keep going!", type: "quote", quote: "'Success is not final, failure is not fatal...'", rarity: "legendary", icon: "star" }
  ],
  
  bosses: [
    { id: 1, name: "Mock Test 1", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], requiredXp: 500, currentXp: 0 },
    { id: 2, name: "Final CA Foundation", date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], requiredXp: 3000, currentXp: 0 }
  ]
};
