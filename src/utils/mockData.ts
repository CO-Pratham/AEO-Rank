// Mock data for dashboard components

export const visibilityData = [
  { date: "1 Aug", AEORank: 0, Google: 12, Udemy: 8 },
  { date: "2 Aug", AEORank: 0, Google: 15, Udemy: 10 },
  { date: "3 Aug", AEORank: 5, Google: 22, Udemy: 12 },
  { date: "4 Aug", AEORank: 8, Google: 18, Udemy: 9 },
  { date: "5 Aug", AEORank: 12, Google: 14, Udemy: 7 },
  { date: "6 Aug", AEORank: 15, Google: 10, Udemy: 5 },
  { date: "7 Aug", AEORank: 18, Google: 8, Udemy: 4 },
  { date: "8 Aug", AEORank: 22, Google: 6, Udemy: 3 },
];

export const industryRanking = [
  {
    rank: 1,
    brand: "Google",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=Google&backgroundColor=4285f4",
    position: 5.7,
    sentiment: 64,
    visibility: "10%",
    change: "+2%"
  },
  {
    rank: 2,
    brand: "Udemy",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=Udemy&backgroundColor=ec5252",
    position: 3.3,
    sentiment: 59,
    visibility: "5%",
    change: "+1%"
  },
  {
    rank: 3,
    brand: "Coursera",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=Coursera&backgroundColor=0056d3",
    position: 3.0,
    sentiment: 59,
    visibility: "5%",
    change: "0%"
  },
  {
    rank: 4,
    brand: "CodersLab",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=CodersLab&backgroundColor=f59e0b",
    position: 1.9,
    sentiment: 57,
    visibility: "4%",
    change: "-1%"
  },
  {
    rank: 5,
    brand: "FutureCollars",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=FutureCollars&backgroundColor=06b6d4",
    position: 3.2,
    sentiment: 59,
    visibility: "2%",
    change: "+3%"
  },
  {
    rank: 6,
    brand: "AEORank",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=AEORank&backgroundColor=dc2626",
    position: 1.0,
    sentiment: 56,
    visibility: "1%",
    change: "+5%"
  },
];

export const recentMentions = [
  {
    id: 1,
    brand: "AEORank",
    position: 14,
    mentions: "AI SEO optimization tools comparison",
    timeAgo: "14 min ago",
    source: "ChatGPT",
    url: "cpq-integrations.com",
    usage: "33%"
  },
  {
    rank: 2,
    brand: "Google",
    position: 8,
    mentions: "Best search engine optimization",
    timeAgo: "25 min ago",
    source: "Claude",
    url: "reddit.com",
    usage: "28%"
  },
  {
    id: 3,
    brand: "Udemy",
    position: 3,
    mentions: "Online learning platforms review",
    timeAgo: "1 hour ago",
    source: "Perplexity",
    url: "techcrunch.com",
    usage: "45%"
  }
];

export const promptsData = [
  {
    id: 1,
    prompt: "SEO courses in Poland",
    position: 1.0,
    sentiment: 56,
    visibility: "67%",
    platforms: ["ChatGPT", "Claude", "Gemini"],
    dataSource: "ChatGPT", // Which AI model was used to analyze this data
    location: "PL",
    created: "17 min ago",
    status: "active"
  },
  {
    id: 2,
    prompt: "What online school guarantees work in IT?",
    position: 0,
    sentiment: 0,
    visibility: "0%",
    platforms: ["CodersLab", "FutureCollars"],
    dataSource: "Claude", // Which AI model was used to analyze this data
    location: "PL",
    created: "15 min ago",
    status: "active"
  },
  {
    id: 3,
    prompt: "Programming schools with mentoring system",
    position: 0,
    sentiment: 0,
    visibility: "0%",
    platforms: ["CodersLab", "FutureCollars", "Udemy"],
    dataSource: "Gemini", // Which AI model was used to analyze this data
    location: "PL",
    created: "15 min ago",
    status: "active"
  },
  {
    id: 4,
    prompt: "Online marketing training with brand practices",
    position: 0,
    sentiment: 0,
    visibility: "0%",
    platforms: ["Google", "Udemy"],
    dataSource: "GPT-4", // Which AI model was used to analyze this data
    location: "PL",
    created: "15 min ago",
    status: "inactive"
  },
  {
    id: 5,
    prompt: "IT courses for emigrants with certificate",
    position: 0,
    sentiment: 0,
    visibility: "0%",
    platforms: ["Google", "CodersLab", "Udemy"],
    dataSource: "Perplexity", // Which AI model was used to analyze this data
    location: "PL",
    created: "15 min ago",
    status: "suggested"
  }
];

export const sourcesData = [
  {
    id: 1,
    source: "cpq-integrations.com",
    mentions: 156,
    position: 2.3,
    sentiment: 72,
    lastMention: "2 hours ago",
    platforms: ["ChatGPT", "Claude"]
  },
  {
    id: 2,
    source: "reddit.com",
    mentions: 89,
    position: 4.1,
    sentiment: 58,
    lastMention: "5 hours ago",
    platforms: ["Claude", "Perplexity"]
  },
  {
    id: 3,
    source: "techcrunch.com",
    mentions: 43,
    position: 1.8,
    sentiment: 81,
    lastMention: "1 day ago",
    platforms: ["ChatGPT", "Gemini", "Perplexity"]
  }
];

export const competitorsData = [
  {
    id: 1,
    name: "Google",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=Google&backgroundColor=4285f4",
    visibility: 45,
    position: 5.7,
    sentiment: 64,
    change: "+2.3%",
    trend: "up"
  },
  {
    id: 2,
    name: "Udemy",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=Udemy&backgroundColor=ec5252",
    visibility: 32,
    position: 3.3,
    sentiment: 59,
    change: "+1.1%",
    trend: "up"
  },
  {
    id: 3,
    name: "Coursera",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=Coursera&backgroundColor=0056d3",
    visibility: 28,
    position: 3.0,
    sentiment: 59,
    change: "0%",
    trend: "stable"
  }
];

export const tagsData = [
  { id: 1, name: "AI SEO", usage: 89, mentions: 234, color: "#ef4444" },
  { id: 2, name: "Online Learning", usage: 76, mentions: 189, color: "#3b82f6" },
  { id: 3, name: "Programming", usage: 65, mentions: 156, color: "#10b981" },
  { id: 4, name: "Marketing", usage: 54, mentions: 123, color: "#f59e0b" },
  { id: 5, name: "Education", usage: 43, mentions: 98, color: "#8b5cf6" },
];