import ServiceForm from "@/components/admin/ServiceForm";
import { createService } from "@/lib/actions/services";

export default function NewServicePage() {
  return (
    <div>
      <div className="adm-title">New Service</div>
      <ServiceForm action={createService} />
    </div>
  );
}
