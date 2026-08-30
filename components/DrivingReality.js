import { getDrivingReality } from "@/lib/driving-reality";

export default function DrivingReality() {
  const data = getDrivingReality();
  const { oldMission, leelanau, ratios } = data;

  return (
    <section className="driving-reality" aria-labelledby="driving-reality-title">
      <p className="publisher-eyebrow">Original map analysis</p>
      <h2 id="driving-reality-title">Old Mission vs. Leelanau: the driving reality</h2>
      <p>
        The useful difference is not simply winery count. It is geographic spread. Using the current production winery/tasting-room
        coordinates, Leelanau&apos;s wine-country footprint is about {ratios.northSouthSpread}× taller north-to-south and {ratios.eastWestSpread}×
        wider east-to-west than Old Mission.
      </p>

      <div className="driving-reality-grid">
        <div>
          <strong>{oldMission.northSouthMiles} mi</strong>
          <span>Old Mission north-south geographic span</span>
        </div>
        <div>
          <strong>{leelanau.northSouthMiles} mi</strong>
          <span>Leelanau north-south geographic span</span>
        </div>
        <div>
          <strong>{oldMission.medianPairMiles} mi</strong>
          <span>Old Mission median winery-to-winery straight-line separation</span>
        </div>
        <div>
          <strong>{leelanau.medianPairMiles} mi</strong>
          <span>Leelanau median winery-to-winery straight-line separation</span>
        </div>
      </div>

      <h3>The surprising part</h3>
      <p>
        The median nearest-neighbor distance is almost identical: {oldMission.medianNearestMiles} miles on Old Mission and {leelanau.medianNearestMiles} miles on Leelanau.
        In other words, Leelanau still has tight local clusters. The extra driving comes from moving between those clusters, not from every winery being far from the next one.
      </p>

      <div className="driving-reality-table-wrap">
        <table className="driving-reality-table">
          <thead>
            <tr><th>Measure</th><th>Old Mission</th><th>Leelanau</th></tr>
          </thead>
          <tbody>
            <tr><td>Mapped winery/tasting-room locations</td><td>{oldMission.count}</td><td>{leelanau.count}</td></tr>
            <tr><td>Distinct towns represented</td><td>{oldMission.townCount}</td><td>{leelanau.townCount}</td></tr>
            <tr><td>North-south geographic span</td><td>{oldMission.northSouthMiles} mi</td><td>{leelanau.northSouthMiles} mi</td></tr>
            <tr><td>East-west geographic span</td><td>{oldMission.eastWestMiles} mi</td><td>{leelanau.eastWestMiles} mi</td></tr>
            <tr><td>Median pair separation</td><td>{oldMission.medianPairMiles} mi</td><td>{leelanau.medianPairMiles} mi</td></tr>
            <tr><td>75th-percentile pair separation</td><td>{oldMission.p75PairMiles} mi</td><td>{leelanau.p75PairMiles} mi</td></tr>
            <tr><td>Median nearest-neighbor separation</td><td>{oldMission.medianNearestMiles} mi</td><td>{leelanau.medianNearestMiles} mi</td></tr>
            <tr><td>Median straight-line distance from Traverse City</td><td>{oldMission.medianFromTraverseCityMiles} mi</td><td>{leelanau.medianFromTraverseCityMiles} mi</td></tr>
          </tbody>
        </table>
      </div>

      <p className="driving-reality-method">
        Method: {data.method} Dataset updated {data.updated}. For road routing and actual trip timing, use the planner above.
      </p>
      <p>
        <a href="/api/publisher/driving-reality.json">Download the analysis JSON →</a>
      </p>
    </section>
  );
}
