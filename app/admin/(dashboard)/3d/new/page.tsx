import Model3DForm from "@/components/admin/Model3DForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { createModel3D } from "@/lib/actions/models3d";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { getActiveArtMetadataOptions } from "@/lib/art-metadata";

export default async function NewModel3DPage() {
  const [appearance, categoryOptions] = await Promise.all([
    getPageAppearance("3d"),
    getActiveArtMetadataOptions("3d"),
  ]);

  return (
    <div>
      <AdminPageHeader title="New 3D Model" />
      <Model3DForm action={createModel3D} pageVars={pageAppearanceVars(appearance)} categoryOptions={categoryOptions} />
    </div>
  );
}
