import Model3DForm from "@/components/admin/Model3DForm";
import { createModel3D } from "@/lib/actions/models3d";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";

export default async function NewModel3DPage() {
  const appearance = await getPageAppearance("3d");

  return (
    <div>
      <div className="adm-title">New 3D Model</div>
      <Model3DForm action={createModel3D} pageVars={pageAppearanceVars(appearance)} />
    </div>
  );
}
