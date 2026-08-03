import { db } from "@/db";
import { cvContent } from "@/db/schema";
import CVViewer from "@/components/CVViewer";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

export default async function CVPage() {
  const [[row], appearance] = await Promise.all([
    db.select().from(cvContent).limit(1),
    getPageAppearance("cv"),
  ]);

  return (
    <div className="page" style={pageAppearanceVars(appearance)}>
      <CVViewer img={row?.img ?? null} />
    </div>
  );
}
