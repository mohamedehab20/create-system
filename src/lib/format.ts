const ZONES: Record<string, string> = {
  مصر: "Africa/Cairo",
  السعودية: "Asia/Riyadh",
  الإمارات: "Asia/Dubai",
  الأردن: "Asia/Amman",
  الكويت: "Asia/Kuwait",
  قطر: "Asia/Qatar",
  البحرين: "Asia/Bahrain",
  عُمان: "Asia/Muscat",
  المغرب: "Africa/Casablanca",
  تونس: "Africa/Tunis",
  الجزائر: "Africa/Algiers",
  العراق: "Asia/Baghdad",
  لبنان: "Asia/Beirut",
};

const CURRENCY_SUFFIX: Record<string, string> = {
  EGP: "ج.م",
  SAR: "ر.س",
  AED: "د.إ",
  USD: "$",
};

export function zoneFor(country?: string) {
  return (country && ZONES[country]) || "Africa/Cairo";
}

export function todayISO(country?: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: zoneFor(country),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function formatMoney(amount: number, currency: string) {
  const number = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${number} ${CURRENCY_SUFFIX[currency] ?? currency}`;
}

export function formatWhen(iso: string, country?: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    timeZone: zoneFor(country),
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatTime(iso: string, country?: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    timeZone: zoneFor(country),
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function greeting(country?: string) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: zoneFor(country),
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date()),
  );
  return hour < 12 ? "صباح الخير" : "مساء الخير";
}
