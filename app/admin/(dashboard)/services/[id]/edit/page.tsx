import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { services } from "@/db/schema";
import ServiceForm from "@/components/admin/ServiceForm";
import { updateService } from "@/lib/actions/services";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item] = await db.select().from(services).where(eq(services.id, Number(id)));
  if (!item) notFound();

  const updateWithId = updateService.bind(null, item.id);

  return (
    <div>
      <div className="adm-title">Edit Service</div>
      <ServiceForm action={updateWithId} item={item} />
    </div>
  );
}
