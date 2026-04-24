import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { ShieldAlert } from "lucide-react";

interface WorldMapProps {
  onRegionSelect: (region: string | null, data: any) => void;
  timePeriod: "past" | "present" | "future";
  viewMode: "wbgt" | "rain";
  setViewMode: React.Dispatch<React.SetStateAction<"wbgt" | "rain">>;
}

/* ================= WBGT ================= */

const calculateWBGT = (
  lat: number,
  timePeriod: "past" | "present" | "future"
) => {
  const equatorFactor = 1 - Math.abs(lat) / 90;
  let wbgt = 22 + equatorFactor * 12;

  if (timePeriod === "past") wbgt -= 2;
  if (timePeriod === "future") wbgt += 3;

  wbgt += (Math.random() - 0.5) * 1.2;
  return wbgt;
};

const getWBGTColor = (wbgt: number) => {
  if (wbgt < 28) return "#3b82f6";
  if (wbgt < 32) return "#eab308";
  return "#ef4444";
};

/* ================= RAIN ================= */

const calculateRainfall = (lat: number) => {
  const equatorFactor = 1 - Math.abs(lat) / 90;
  let rain = equatorFactor * 175;
  rain += Math.random() * 20;
  return rain;
};

const getRainColor = (rain: number) => {
  if (rain < 70) return "#ffffff";
  if (rain < 110) return "#93f1fd";
  if (rain < 145) return "#3bf654";
  return "#13401d";
};

/* ================================================= */

export const WorldMap: React.FC<WorldMapProps> = ({
  onRegionSelect,
  timePeriod,
  viewMode,
  setViewMode,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [worldData, setWorldData] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [error, setError] = useState<string | null>(null);

  const rotationRef = useRef(0);
  const rotateRef = useRef<[number, number, number]>([0, 0, 0]);
  const velocityRef = useRef(0.03);
  const isDraggingRef = useRef(false);
  const isFocusedRef = useRef(false);
  const zoomRef = useRef(1);

  /* ================= LOAD MAP ================= */

  useEffect(() => {
    fetch(
      "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
    )
      .then((res) => res.json())
      .then(setWorldData)
      .catch(() => setError("Satellite link unstable."));
  }, []);

  /* ================= RESIZE ================= */

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setDimensions({ width: rect.width, height: rect.height });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  /* ================= MAIN GLOBE ================= */

  useEffect(() => {
    if (!worldData || !svgRef.current || dimensions.width === 0) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const baseScale = Math.min(width, height) / 2.1;

    const projection = d3
      .geoOrthographic()
      .scale(baseScale * zoomRef.current)
      .translate([width / 2, height / 2])
      .rotate(rotateRef.current);

    const path = d3.geoPath().projection(projection);
    const g = svg.append("g");

    /* ================= OCEAN ================= */

    g.append("path")
      .datum({ type: "Sphere" })
      .attr("d", path)
      .attr("fill", "#102432")
      .style("cursor", "grab")
      .on("click", () => {
        if (!isFocusedRef.current) return;

        isFocusedRef.current = false;

        const targetRotation: [number, number, number] = [0, 0, 0];
        const targetZoom = 1;

        d3.transition()
          .duration(1000)
          .tween("reset", () => {
            const r = d3.interpolate(rotateRef.current, targetRotation);
            const z = d3.interpolate(zoomRef.current, targetZoom);

            return (t) => {
              rotateRef.current = r(t);
              zoomRef.current = z(t);

              projection
                .rotate(rotateRef.current)
                .scale(baseScale * zoomRef.current);

              svg.selectAll("path").attr("d", path);
            };
          });

        onRegionSelect(null, null);
      });

    const countries = topojson.feature(
      worldData,
      worldData.objects.countries
    ) as any;

    /* ================= COUNTRIES ================= */

    g.selectAll(".country")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("stroke", "#000")
      .attr("stroke-width", 0.6)
      .style("cursor", "pointer")
      .attr("fill", (d: any) => {
        const [, lat] = d3.geoCentroid(d);

        return viewMode === "wbgt"
          ? getWBGTColor(calculateWBGT(lat, timePeriod))
          : getRainColor(calculateRainfall(lat));
      })
      .on("click", (_, d: any) => {
        const [lon, lat] = d3.geoCentroid(d);
        const wbgt = calculateWBGT(lat, timePeriod);
        const rainfall = calculateRainfall(lat);

        isFocusedRef.current = true;

        const targetRotation: [number, number, number] = [-lon, -lat, 0];
        const targetZoom = 1.8;

        d3.transition()
          .duration(1000)
          .tween("rotateZoom", () => {
            const r = d3.interpolate(rotateRef.current, targetRotation);
            const z = d3.interpolate(zoomRef.current, targetZoom);

            return (t) => {
              rotateRef.current = r(t);
              zoomRef.current = z(t);

              projection
                .rotate(rotateRef.current)
                .scale(baseScale * zoomRef.current);

              svg.selectAll("path").attr("d", path);
            };
          });

        onRegionSelect(d.properties.name, {
          wbgt,
          rainfall,
          temp: 24 + (wbgt - 26),
          humidity: 55 + Math.random() * 20,
          lat,
          lon,
        });
      });

    /* ================= DRAG ================= */

    const drag = d3
      .drag<SVGSVGElement, unknown>()
      .on("start", () => (isDraggingRef.current = true))
      .on("drag", (event: any) => {
        rotateRef.current[0] += event.dx * 0.25;
        rotateRef.current[1] -= event.dy * 0.25;
        projection.rotate(rotateRef.current);
        svg.selectAll("path").attr("d", path);
      })
      .on("end", () => {
        isDraggingRef.current = false;
        rotationRef.current = rotateRef.current[0];
      });

    svg.call(drag);

    /* ================= AUTO ROTATION ================= */

    const timer = d3.timer(() => {
      if (!isDraggingRef.current && !isFocusedRef.current) {
        rotationRef.current += velocityRef.current;
        rotateRef.current[0] = rotationRef.current;
        projection.rotate(rotateRef.current);
        svg.selectAll("path").attr("d", path);
      }
    });

    return () => timer.stop();
  }, [worldData, dimensions, timePeriod, viewMode]);

  /* ================= UI ================= */

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-950 overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
    >
      <button
        onClick={() =>
          setViewMode((prev) => (prev === "wbgt" ? "rain" : "wbgt"))
        }
        className="absolute top-4 left-4 z-20 px-4 py-2 bg-emerald-500 text-black rounded-lg text-xs font-semibold"
      >
        {viewMode === "wbgt" ? "Show Rainfall" : "Show Heat"}
      </button>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ShieldAlert className="text-red-400" size={48} />
        </div>
      )}

      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};