export default function AuthorNote({ context = "Traverse City wine country" }) {
  return (
    <aside className="author-note" aria-label="About the builder">
      <span>Built and maintained by</span>
      <strong>
        <a href="https://chrisizworski.com/chris-izworski/" rel="author">Chris Izworski</a>
      </strong>
      <p>
        A Michigan-based builder of practical trip and Great Lakes planning tools. This {context} planner
        uses structured venue data, current posted hours, geographic routing, and transparent fallback
        estimates rather than a sponsored ranking.
      </p>
      <a className="author-more" href="https://chrisizworski.com/chris-izworski-works/">
        See Chris Izworski&apos;s Michigan tools →
      </a>
    </aside>
  );
}
