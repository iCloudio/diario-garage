function toCalendarDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function getLicenseExpiryDiffDays(licenseExpiry: Date, now = new Date()) {
  const expiryDay = toCalendarDay(licenseExpiry);
  const nowDay = toCalendarDay(now);

  return Math.ceil((expiryDay.getTime() - nowDay.getTime()) / (1000 * 60 * 60 * 24));
}

export function getLicenseExpiryClass(licenseExpiry: Date, now = new Date()) {
  const diffDays = getLicenseExpiryDiffDays(licenseExpiry, now);

  if (diffDays <= 30) {
    return "border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-300";
  }

  if (diffDays <= 90) {
    return "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300";
  }

  return "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
}

export function getLicenseExpiryAnimationClass(licenseExpiry: Date, now = new Date()) {
  return getLicenseExpiryDiffDays(licenseExpiry, now) <= 0 ? "deadline-chip-alert" : "";
}

export function formatLicenseExpiryLabel(licenseExpiry: Date) {
  return licenseExpiry.toLocaleDateString("it-IT");
}
