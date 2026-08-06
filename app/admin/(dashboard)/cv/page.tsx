import { db } from "@/db";
import { cvContent } from "@/db/schema";
import FileUploadField from "@/components/admin/FileUploadField";
import SaveButton from "@/components/admin/SaveButton";
import { updateCvContent } from "@/lib/actions/cv";

export default async function AdminCvPage() {
  const [row] = await db.select().from(cvContent).limit(1);
  const current = row?.img ?? undefined;
  const isPdf = current?.toLowerCase().endsWith(".pdf");

  return (
    <div>
      <div className="adm-title">CV</div>
      <p className="adm-sub">Upload your CV as an image or a PDF. Powers the &quot;Download CV (PDF)&quot; button on /about.</p>
      {current && (
        isPdf ? (
          <div className="adm-hint">📄 PDF uploaded — {current.split("/").pop()}</div>
        ) : (
          <img src={current} alt="" className="adm-img-preview" />
        )
      )}
      <form action={updateCvContent} className="adm-form">
        <FileUploadField name="img" initialUrl={current} label="CV File" category="document" />
        <SaveButton />
      </form>
    </div>
  );
}
