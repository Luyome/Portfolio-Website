import SketchForm from "@/components/admin/SketchForm";
import { createSketch } from "@/lib/actions/sketches";

export default function NewSketchPage() {
  return (
    <div>
      <div className="adm-title">New Sketch</div>
      <SketchForm action={createSketch} />
    </div>
  );
}
