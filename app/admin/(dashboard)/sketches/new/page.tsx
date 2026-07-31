import SketchForm from "@/components/admin/SketchForm";
import { createSketch } from "@/lib/actions/sketches";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

export default async function NewSketchPage() {
  const appearance = await getPageAppearance("sketches");

  return (
    <div>
      <div className="adm-title">New Sketch</div>
      <SketchForm action={createSketch} pageVars={pageAppearanceVars(appearance)} />
    </div>
  );
}
