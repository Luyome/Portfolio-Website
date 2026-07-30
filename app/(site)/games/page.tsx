import { asc } from "drizzle-orm";
import { db } from "@/db";
import { games } from "@/db/schema";

export default async function GamesPage() {
  const items = await db.select().from(games).orderBy(asc(games.sortOrder));

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-wm">ゲーム</div>
        <div className="ph-eyebrow">Game Development</div>
        <h2 className="ph-title">Games</h2>
        <p className="ph-sub">Solo and group projects. Unreal Engine 5.</p>
      </div>
      <div className="games-wrap">
        {items.map((g) => (
          <div className="game-card" key={g.id}>
            <div className="game-cover">
              <img src={g.img} alt={g.title} />
              <div className="game-cover-over">
                <div className="gco-st">{g.status} — {g.engine}</div>
                <div className="gco-t">{g.title}</div>
              </div>
            </div>
            <div className="game-body">
              <div>
                <p className="gb-desc">{g.desc}</p>
                <div className="gb-tags">
                  {g.tags.map((t) => (
                    <span className="gb-tag" key={t}>{t}</span>
                  ))}
                </div>
              </div>
              <div className="g-aside">
                <div className="ga-lbl">Features</div>
                {g.feats.map((f) => (
                  <div className="ga-feat" key={f}>{f}</div>
                ))}
                <div className="ga-tgt">
                  <strong>Target</strong>
                  <span>{g.target}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
