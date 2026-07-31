import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { games, gameLinks } from "@/db/schema";
import GameForm from "@/components/admin/GameForm";
import DeleteButton from "@/components/admin/DeleteButton";
import NumberPicker from "@/components/admin/NumberPicker";
import { updateGame, createGameLink, updateGameLink, deleteGameLink } from "@/lib/actions/games";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

export default async function EditGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gameId = Number(id);
  const [item] = await db.select().from(games).where(eq(games.id, gameId));
  if (!item) notFound();

  const [links, appearance] = await Promise.all([
    db.select().from(gameLinks).where(eq(gameLinks.gameId, gameId)).orderBy(asc(gameLinks.sortOrder)),
    getPageAppearance("games"),
  ]);

  const updateWithId = updateGame.bind(null, item.id);
  const createLinkWithId = createGameLink.bind(null, gameId);

  return (
    <div>
      <div className="adm-title">Edit Game</div>
      <GameForm action={updateWithId} item={item} pageVars={pageAppearanceVars(appearance)} />

      <p className="adm-sub" style={{ marginTop: 48 }}>Links</p>
      <p className="adm-sub" style={{ marginTop: 0 }}>Shown in the game&apos;s detail panel on the public Games page (Steam, trailer, Discord, etc).</p>
      <table className="adm-table" style={{ marginTop: 16 }}>
        <thead>
          <tr>
            <th>Label</th>
            <th>URL</th>
            <th>Order</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {links.map((l) => {
            const updateLinkWithId = updateGameLink.bind(null, l.id);
            const formId = `game-link-form-${l.id}`;
            return (
              <tr key={l.id}>
                <td>
                  <form id={formId} action={updateLinkWithId}>
                    <input name="label" defaultValue={l.label} placeholder="Steam" required />
                  </form>
                </td>
                <td>
                  <input name="href" form={formId} defaultValue={l.href} placeholder="https://store.steampowered.com/..." required />
                </td>
                <td>
                  <NumberPicker name="sortOrder" defaultValue={l.sortOrder} formId={formId} />
                </td>
                <td>
                  <div className="adm-actions">
                    <button type="submit" form={formId} className="adm-btn" style={{ padding: "8px 14px" }}>Save</button>
                    <form action={deleteGameLink}>
                      <input type="hidden" name="id" value={l.id} />
                      <DeleteButton confirmText={`Delete "${l.label}" link?`} />
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="adm-sub" style={{ marginTop: 32 }}>Add Link</p>
      <form action={createLinkWithId} className="adm-form">
        <div className="adm-field">
          <label htmlFor="link-label">Label</label>
          <input id="link-label" name="label" placeholder="Steam" required />
        </div>
        <div className="adm-field">
          <label htmlFor="link-href">URL</label>
          <input id="link-href" name="href" placeholder="https://store.steampowered.com/..." required />
        </div>
        <div className="adm-field">
          <label>Sort Order</label>
          <NumberPicker name="sortOrder" defaultValue={links.length} />
        </div>
        <button type="submit" className="adm-btn">Add Link</button>
      </form>
    </div>
  );
}
