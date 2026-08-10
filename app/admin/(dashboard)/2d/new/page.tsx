import SketchForm from "@/components/admin/SketchForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { createSketch } from "@/lib/actions/sketches";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { getActiveArtMetadataOptions } from "@/lib/art-metadata";

export default async function New2DPage() {
  const [appearance, categoryOptions] = await Promise.all([
    getPageAppearance("2d"),
    getActiveArtMetadataOptions(),
  ]);

  return (
    <div>
      <AdminPageHeader title="New 2D Item" />
      <SketchForm action={createSketch} pageVars={pageAppearanceVars(appearance)} categoryOptions={categoryOptions} />
    </div>
  );
}
