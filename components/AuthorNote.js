export default function AuthorNote({ context = "Traverse City wine country" }) {
  return (
    <aside className="author-note" aria-label="About the builder">
      <span>Built and maintained by</span>
      <strong>
        <a href="https://chrisizworski.com/chris-izworski/" rel="author">Chris Izworski</a>
      </strong>
      <p>
        We enjoy Michigan wine country and return often. A good wine day should have time for the glass, the roads,
        the view, and a proper meal—not just a race between tasting rooms. This {context} planner is built
        on that practical perspective, using structured venues, documented wine information, posted hours,
        routing, and clearly labeled estimates instead of paid rankings. Personal interest is not a claim
        that we have tasted at every winery.
      </p>
      <a className="author-more" href="https://chrisizworski.com/chris-izworski-works/">
        See Chris Izworski&apos;s Michigan tools →
      </a>
    </aside>
  );
}
