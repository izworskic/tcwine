// Scripted best paths for the persona benchmark after the "what kind of day?" redesign.
const intent = (id) => async (u) => { await u.tap(`#intentChips button[data-intent="${id}"]`); };
export const DRIVERS = {
  after: {
    "first-timer-couple": intent("first"),
    "group-of-8": intent("group"),
    "wine-enthusiast": async (u) => { await u.tap('#intentChips button[data-intent="lover"]'); await u.tap('[data-plan-style="riesling"]'); await u.tap('[data-plan-style="cabernet-franc"]'); },
    "fall-color": intent("views"),
    "family-non-drinker": intent("family"),
    "open-now": intent("now"),
    "beer-cider": intent("beer"),
    "local-weekday": async (u) => { await u.fill("#dateInput", "2026-10-19"); await u.tap('#intentChips button[data-intent="first"]'); },
    "based-in-leland": async (u) => { await u.select("#originSelect", "Leland"); await u.tap('#intentChips button[data-intent="first"]'); },
    "dog-owner": async (u) => { await u.tap('#needChips button[data-need="dog"]'); },
  },
};
