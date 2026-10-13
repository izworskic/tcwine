export const REGIONS = {
  "old-mission": {
    label: "Old Mission Peninsula",
    mood: "A focused vineyard day on the narrow ridge between the two arms of Grand Traverse Bay.",
    action: "Plan Old Mission wineries",
    url: "https://tcwine.chrisizworski.com/old-mission-peninsula-wineries",
    tradeoff: "You give up the longer harbor-town road trip in exchange for a compact route.",
  },
  leelanau: {
    label: "Leelanau Peninsula",
    mood: "A rambling wine day with villages, vineyard hills, bay views, and room to linger.",
    action: "Plan Leelanau wineries",
    url: "https://tcwine.chrisizworski.com/leelanau-peninsula-wine-trail",
    tradeoff: "Distances between villages are real. Pick one sub-region rather than chasing every name.",
  },
  petoskey: {
    label: "Petoskey / Tip of the Mitt",
    mood: "Northern lake country: small tasting rooms, cold-hardy wine styles, and a slower day near Little Traverse Bay.",
    action: "Plan Petoskey wineries",
    url: "https://chrisizworski.com/petoskey-wine/",
    tradeoff: "This is not a Leelanau Riesling day. Expect a distinct cold-climate wine program and spread-out stops.",
  },
};

export function decide(base, priority, time) {
  // The first gate is geography, not a fictitious wine-quality score.
  if (base === "petoskey") {
    return {
      winner: "petoskey",
      alternate: "leelanau",
      why: "You are already in the Little Traverse Bay area. A wine day works better when most of it is spent tasting and exploring, not driving to a distant peninsula.",
      caution: time === "short" ? "Keep this to a tight Walloon Lake or Petoskey cluster; do not attempt the whole trail." : "Even with a full day, choose a local cluster. The far ends of the trail are not one convenient loop.",
    };
  }
  if (base === "leelanau") {
    return {
      winner: "leelanau",
      alternate: "old-mission",
      why: priority === "wine" ? "Start where you are and build a wine-led route with the varietal filters, rather than crossing Traverse City just to reach a different peninsula." : "Suttons Bay and the Leelanau villages are your natural starting points. Keep this day on one side of the peninsula.",
      caution: time === "short" ? "Stay near Suttons Bay or Lake Leelanau, not the entire M-22 loop." : "A full day still benefits from one village cluster and a deliberate meal.",
    };
  }
  if (priority === "harbors" && time === "full" || priority === "sparkling" && time === "full") {
    return {
      winner: "leelanau",
      alternate: "old-mission",
      why: priority === "sparkling" ? "A dedicated sparkling-wine day deserves the larger Leelanau route, where you can build around a specialist instead of choosing by distance alone." : "You have time for the Suttons Bay and Leelanau village experience, rather than only the simplest drive out of Traverse City.",
      caution: "Do not mix far-north Leelanau stops and Old Mission into one ambitious itinerary. Confirm tasting reservations.",
    };
  }
  return {
    winner: "old-mission",
    alternate: "leelanau",
    why: priority === "sparkling" ? "For a shorter Traverse City day, a compact peninsula limits transit. For a sparkling specialist across the bay, allow more time and choose Leelanau instead." : "From Traverse City, the narrow Old Mission route is the simplest way to spend your available hours on wineries rather than transitions.",
    caution: time === "short" ? "Choose two, perhaps three nearby stops. This is not time to complete a trail checklist." : "Even with a full day, allow time for lunch and the bay; do not plan a race.",
  };
}
