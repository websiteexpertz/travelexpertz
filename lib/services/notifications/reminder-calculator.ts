/**
 * Reminder Timezone & Offset Calculator
 * Target Timezone: Asia/Kolkata (IST = UTC + 5:30)
 */

export interface ReminderSchedule {
  reminder48h: { scheduledAt: Date; isPast: boolean };
  reminder24h: { scheduledAt: Date; isPast: boolean };
  reminder2h: { scheduledAt: Date; isPast: boolean };
}

/**
 * Parses a check-in date/time string and computes reminder triggers in UTC.
 * Default check-in time: 12:00 PM IST (UTC 06:30) if no explicit time is configured.
 */
export function calculateReminderTimes(
  checkinStr: string,
  checkinTimeStr: string = "12:00",
  now: Date = new Date()
): ReminderSchedule {
  // Parse checkin date (YYYY-MM-DD or ISO string)
  let year: number;
  let month: number; // 0-based
  let day: number;

  if (checkinStr.includes("T")) {
    const d = new Date(checkinStr);
    year = d.getUTCFullYear();
    month = d.getUTCMonth();
    day = d.getUTCDate();
  } else if (checkinStr.includes("-")) {
    const parts = checkinStr.split("-").map(Number);
    year = parts[0];
    month = parts[1] - 1;
    day = parts[2];
  } else if (checkinStr.includes("/")) {
    const parts = checkinStr.split("/").map(Number);
    // DD/MM/YYYY
    day = parts[0];
    month = parts[1] - 1;
    year = parts[2];
  } else {
    const d = new Date(checkinStr);
    year = d.getFullYear();
    month = d.getMonth();
    day = d.getDate();
  }

  // Parse checkin time (HH:MM in IST)
  const timeParts = checkinTimeStr.split(":").map(Number);
  const hours = isNaN(timeParts[0]) ? 12 : timeParts[0];
  const minutes = isNaN(timeParts[1]) ? 0 : timeParts[1];

  // IST offset is UTC + 5:30. In UTC milliseconds:
  // Target UTC timestamp = Date.UTC(year, month, day, hours, minutes) - (5.5 * 3600 * 1000)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const targetCheckInUtcMs =
    Date.UTC(year, month, day, hours, minutes) - istOffsetMs;

  const ms48Hours = 48 * 60 * 60 * 1000;
  const ms24Hours = 24 * 60 * 60 * 1000;
  const ms2Hours = 2 * 60 * 60 * 1000;

  const date48h = new Date(targetCheckInUtcMs - ms48Hours);
  const date24h = new Date(targetCheckInUtcMs - ms24Hours);
  const date2h = new Date(targetCheckInUtcMs - ms2Hours);

  const nowMs = now.getTime();

  return {
    reminder48h: {
      scheduledAt: date48h,
      isPast: date48h.getTime() <= nowMs,
    },
    reminder24h: {
      scheduledAt: date24h,
      isPast: date24h.getTime() <= nowMs,
    },
    reminder2h: {
      scheduledAt: date2h,
      isPast: date2h.getTime() <= nowMs,
    },
  };
}
