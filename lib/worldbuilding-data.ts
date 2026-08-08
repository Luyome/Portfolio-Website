import { asc, desc, eq, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { worldbuildingEntries, worldbuildingRelationships } from "@/db/schema";
import type { WorldbuildingEntityType } from "@/types/worldbuilding";

export type WorldbuildingEntitySummary = Pick<
  typeof worldbuildingEntries.$inferSelect,
  "id" | "title" | "entityType" | "cat" | "excerpt" | "img"
>;

/** Canonical-type lookup for future discovery and detail surfaces. */
export async function getWorldbuildingEntriesByEntityType(entityType: WorldbuildingEntityType) {
  return db.select().from(worldbuildingEntries)
    .where(eq(worldbuildingEntries.entityType, entityType))
    .orderBy(desc(worldbuildingEntries.year), asc(worldbuildingEntries.sortOrder), asc(worldbuildingEntries.id));
}

/**
 * Resolves relationships from either side. Inner joins intentionally drop a
 * relation whose referenced entry was removed outside the application; normal
 * cascade FKs prevent that state for application-managed deletes.
 */
export async function getWorldbuildingRelationships(entryId: number) {
  const source = alias(worldbuildingEntries, "worldbuilding_relationship_source");
  const target = alias(worldbuildingEntries, "worldbuilding_relationship_target");
  return db.select({
    id: worldbuildingRelationships.id,
    sourceEntryId: worldbuildingRelationships.sourceEntryId,
    targetEntryId: worldbuildingRelationships.targetEntryId,
    relationshipType: worldbuildingRelationships.relationshipType,
    sortOrder: worldbuildingRelationships.sortOrder,
    source: {
      id: source.id, title: source.title, entityType: source.entityType,
      cat: source.cat, excerpt: source.excerpt, img: source.img,
    },
    target: {
      id: target.id, title: target.title, entityType: target.entityType,
      cat: target.cat, excerpt: target.excerpt, img: target.img,
    },
  }).from(worldbuildingRelationships)
    .innerJoin(source, eq(worldbuildingRelationships.sourceEntryId, source.id))
    .innerJoin(target, eq(worldbuildingRelationships.targetEntryId, target.id))
    .where(or(eq(worldbuildingRelationships.sourceEntryId, entryId), eq(worldbuildingRelationships.targetEntryId, entryId)))
    .orderBy(asc(worldbuildingRelationships.sortOrder), asc(worldbuildingRelationships.id));
}

/** Related summaries with their direction relative to the requested entity. */
export async function getRelatedWorldbuildingEntitySummaries(entryId: number) {
  const relationships = await getWorldbuildingRelationships(entryId);
  return relationships.map((relationship) => ({
    relationshipId: relationship.id,
    relationshipType: relationship.relationshipType,
    sortOrder: relationship.sortOrder,
    direction: relationship.sourceEntryId === entryId ? "outgoing" as const : "incoming" as const,
    entity: relationship.sourceEntryId === entryId ? relationship.target : relationship.source,
  }));
}
