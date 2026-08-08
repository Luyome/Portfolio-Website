import Link from "next/link";
import type { WorldMap } from "@/lib/map-types";
import type { MapLocation } from "@/lib/map-types";
import HomeInteractiveMap from "./HomeInteractiveMap";

export default function HomeMapPreview({ map, maps, locations }: { map: WorldMap; maps: WorldMap[]; locations: MapLocation[] }) {
  return (
    <section id="home-map" className="home-map-preview" aria-labelledby="home-map-title">
      <div className="hmp-heading">
        <div><p className="hmp-kicker">Worldbuilding / Atlas</p><h2 id="home-map-title">Atlas</h2></div>
        <p>Trace the continents, histories, and distant signals shaping an original science-fiction universe.</p>
      </div>
      <HomeInteractiveMap map={map} maps={maps} locations={locations} />
      <div className="hmp-footer">
        <p>{map.description || "An evolving atlas of places and stories within KRUPNI."}</p>
        <Link href="/worldbuilding" className="hmp-cta">Explore Worldbuilding <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
}
