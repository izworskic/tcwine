// Server component: renders venue hours as static HTML so the data the
// planner ships in its client bundle is also visible to non-JS crawlers.
import venues from "@/data/venues.json";

export const HOURS_VERIFIED = "July 2026";

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DAY_ABBR = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

function fmtTime(t) {
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "pm" : "am";
  let hr = h % 12;
  if (hr === 0) hr = 12;
  return m ? `${hr}:${String(m).padStart(2, "0")}${ap}` : `${hr}${ap}`;
}

// Condenses a weekly schedule into runs of consecutive days that share
// the same times, e.g. "Mon-Wed 10am-6pm, Thu-Sat 10am-7pm, Sun 11am-5pm".
export function condenseWeek(hours) {
  const runs = [];
  let cur = null;
  DAY_ORDER.forEach((day, idx) => {
    const h = hours[day];
    const key = h && h.open && h.close ? h.open + "|" + h.close : null;
    if (key && cur && cur.key === key && cur.endIdx === idx - 1) {
      cur.end = day;
      cur.endIdx = idx;
    } else if (key) {
      cur = { key, start: day, end: day, endIdx: idx, open: h.open, close: h.close };
      runs.push(cur);
    } else {
      cur = null;
    }
  });
  if (!runs.length) return "hours not posted, call ahead";
  return runs
    .map((r) => {
      const label =
        r.start === r.end
          ? DAY_ABBR[r.start]
          : `${DAY_ABBR[r.start]}-${DAY_ABBR[r.end]}`;
      return `${label} ${fmtTime(r.open)}-${fmtTime(r.close)}`;
    })
    .join(", ");
}

export default function VenueHours({ title, areas, towns, categories }) {
  let list = venues;
  if (areas) list = list.filter((v) => areas.includes(v.area));
  if (towns) list = list.filter((v) => towns.includes(v.town));
  if (categories) list = list.filter((v) => categories.includes(v.category));
  list = [...list].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section>
      <h2>{title}</h2>
      <ul>
        {list.map((v) => (
          <li key={v.id}>
            <strong>{v.name}</strong> ({v.town}):{" "}
            {v.needsHours || !v.hours || !Object.keys(v.hours).length ? (
              <>
                call ahead for current hours
                {v.phone ? ` at ${v.phone}` : ""}
              </>
            ) : (
              condenseWeek(v.hours)
            )}
            {v.dwellMinutes ? `. Plan about ${v.dwellMinutes} minutes.` : ""}
          </li>
        ))}
      </ul>
    </section>
  );
}
