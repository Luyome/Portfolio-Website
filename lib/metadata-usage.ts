import type { MetadataType } from "@/lib/metadata";

// Real usage count for a single metadata option — how many existing content
// records currently reference it. Task 2.10 has not added the Portfolio (or
// any other content type's) metadata junction tables yet, so every option's
// real usage is genuinely 0 today; this deliberately does not invent a
// placeholder relation to count against. Extend this function in Task 2.10
// by adding a real `COUNT` query per junction table as each one is
// introduced — it is the single point the Admin Metadata Manager and the
// delete-safety guard (`lib/actions/metadata.ts`) both already call through.
export async function getMetadataUsageCount(id: number, type: MetadataType): Promise<number> {
  void id;
  void type;
  return 0;
}
