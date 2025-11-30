export function diffToText(from, to) {
  if (!from || !to) return "";

  const diffMs = to - from;
  if (diffMs <= 0) return "0 phút";

  const totalMinutes = Math.floor(diffMs / 60000);

  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const mins = totalMinutes % 60;

  const parts = [];
  if (days > 0) parts.push(`${days} ngày`);
  if (hours > 0) parts.push(`${hours} giờ`);
  if (mins > 0) parts.push(`${mins} phút`);

  return parts.join(" ");
}
