import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "America/Sao_Paulo";

export function formatDate(value) {
  if (!value) return "";
  return dayjs(value).tz(TZ).format("DD/MM/YYYY");
}

export function formatDateTime(value) {
  if (!value) return "";
  return dayjs(value).tz(TZ).format("DD/MM/YYYY HH:mm");
}

export function toIsoDate(value) {
  return dayjs(value).format("YYYY-MM-DD");
}
