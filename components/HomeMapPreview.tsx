import Link from "next/link";
import Image from "next/image";
import type { MapLocation, WorldMap } from "@/lib/map-types";
import { isOptimizableImageUrl } from "@/lib/image-host";

export default function HomeMapPreview({ map, pins }: { map: WorldMap; pins: MapLocation[] }) {
  return (
    <section className="home-map-preview" aria-labelledby="home-map-title">
      <div className="hmp-heading">
        <div>
          <p className="hmp-kicker">Worldbuilding / KRUPNI</p>
          <h2 id="home-map-title">A world in motion</h2>
        </div>
        <p>Trace the places, histories, and distant signals shaping an original science-fiction universe.</p>
      </div>

      <div className="hmp-stage">
        <div className="hmp-map" aria-label={`${map.title} map preview`}>
          {map.imageUrl ? (
            <Image
              src={map.imageUrl}
              alt={`Map of ${map.title}`}
              fill
              sizes="(max-width: 820px) 100vw, 86vw"
              unoptimized={!isOptimizableImageUrl(map.imageUrl)}
            />
          ) : (
            <div className="hmp-map-placeholder" aria-label={`${map.title} map artwork is being prepared`} />
          )}
          <div className="hmp-map-shade" aria-hidden="true" />
          {pins.map((pin, index) => (
            <Link
              key={pin.id}
              href="/worldbuilding"
              className={`hmp-pin hmp-pin-${pin.iconType}`}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              aria-label={`Explore ${pin.name} in Worldbuilding`}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
            </Link>
          ))}
          <div className="hmp-map-title">
            <span>Atlas fragment</span>
            <strong>{map.title}</strong>
          </div>
        </div>

        <div className="hmp-index">
          <div className="hmp-index-head">
            <span>Selected coordinates</span>
            <span>{String(pins.length).padStart(2, "0")}</span>
          </div>
          {pins.length > 0 && (
            <ol>
              {pins.map((pin, index) => (
                <li key={pin.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <Link href="/worldbuilding">{pin.name}</Link>
                </li>
              ))}
            </ol>
          )}
          <p>{map.description || "An evolving atlas of places and stories within KRUPNI."}</p>
          <Link href="/worldbuilding" className="hmp-cta">
            Enter Worldbuilding <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
