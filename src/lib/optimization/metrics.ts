import { Path, MachineSettings, TelemetryMetrics } from '../../types';

/**
 * Calculate detailed CAM machine telemetry
 */
export function calculateTelemetryMetrics(
  rawPaths: Path[],
  optimizedPaths: Path[],
  machine: MachineSettings
): TelemetryMetrics {
  let drawDistanceMm = 0;
  let rawVertexCount = 0;
  let optimizedVertexCount = 0;

  for (const path of rawPaths) {
    rawVertexCount += path.length;
  }

  for (const path of optimizedPaths) {
    optimizedVertexCount += path.length;
    for (let i = 0; i < path.length - 1; i++) {
      const dx = path[i + 1][0] - path[i][0];
      const dy = path[i + 1][1] - path[i][1];
      drawDistanceMm += Math.sqrt(dx * dx + dy * dy);
    }
  }

  let airDistanceMm = 0;
  if (optimizedPaths.length > 0) {
    // Initial rapid from home (0,0) to first path start
    const firstPt = optimizedPaths[0][0];
    airDistanceMm += Math.sqrt(firstPt[0] * firstPt[0] + firstPt[1] * firstPt[1]);

    // Rapids between consecutive paths
    for (let i = 0; i < optimizedPaths.length - 1; i++) {
      const lastPt = optimizedPaths[i][optimizedPaths[i].length - 1];
      const nextStartPt = optimizedPaths[i + 1][0];
      const dx = nextStartPt[0] - lastPt[0];
      const dy = nextStartPt[1] - lastPt[1];
      airDistanceMm += Math.sqrt(dx * dx + dy * dy);
    }

    // Final rapid back to home (0,0)
    const finalPt = optimizedPaths[optimizedPaths.length - 1][optimizedPaths[optimizedPaths.length - 1].length - 1];
    airDistanceMm += Math.sqrt(finalPt[0] * finalPt[0] + finalPt[1] * finalPt[1]);
  }

  const totalDistanceMm = drawDistanceMm + airDistanceMm;
  const reductionPercent = rawVertexCount > 0
    ? Math.max(0, ((rawVertexCount - optimizedVertexCount) / rawVertexCount) * 100)
    : 0;

  // Time calculations (feedrate is in mm/min)
  const drawFeedrate = Math.max(100, machine.feedrate);
  const rapidFeedrate = Math.max(100, machine.rapidFeedrate);

  const drawTimeSec = (drawDistanceMm / drawFeedrate) * 60;
  const airTimeSec = (airDistanceMm / rapidFeedrate) * 60;
  const penLiftTimeSec = optimizedPaths.length * ((machine.penDownDelayMs + 50) / 1000);

  const estimatedTimeSec = drawTimeSec + airTimeSec + penLiftTimeSec;
  const efficiencyPercent = estimatedTimeSec > 0
    ? (drawTimeSec / estimatedTimeSec) * 100
    : 0;

  return {
    totalPaths: optimizedPaths.length,
    drawDistanceMm,
    airDistanceMm,
    totalDistanceMm,
    rawVertexCount,
    optimizedVertexCount,
    reductionPercent,
    estimatedTimeSec,
    efficiencyPercent,
  };
}
