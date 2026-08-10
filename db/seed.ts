import "dotenv/config";
import { db } from "./index";
import {
  services,
  portfolioItems,
  sketches,
  worldbuildingEntries,
  games,
  aboutContent,
  timelineEntries,
  siteSettings,
} from "./schema";

// Demo/local-only seed data — never meant to run against the real,
// owner-maintained content database (Sprint 2 Closure Audit, finding 6).
// `npm run db:seed:demo` is the only entry point; the script name itself
// says "demo" so it's never mistaken for a real deploy/migration step, and
// nothing in package.json's build/deploy scripts calls it automatically.
async function seed() {
  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    console.error("Refusing to run the demo seed against a production environment.");
    process.exit(1);
  }

  // Idempotent guard: this script only ever inserts starter rows into an
  // empty table set. If Services (the first table it writes) already has
  // rows — from a prior run of this same script, or real content — every
  // insert below is skipped rather than appending duplicates. It never
  // drops, truncates, or modifies existing rows.
  const [existingService] = await db.select({ id: services.id }).from(services).limit(1);
  if (existingService) {
    console.log("Demo content already present (services has existing rows) — skipping, nothing changed.");
    return;
  }

  console.log("Seeding database with demo content...");

  await db.insert(services).values([
    { icon: "▲", title: "Environment Design", desc: "Atmospheric, narrative-driven environments built in Unreal Engine 5 — spaces that carry story through light, scale, and detail.", sortOrder: 0 },
    { icon: "◆", title: "Hardsurface Prop Modeling", desc: "Detailed hardsurface prop modeling in Blender, built for close-up readability and game-ready topology.", sortOrder: 1 },
    { icon: "✦", title: "Worldbuilding", desc: "KRUPNI — an original sci-fi universe set in the year 2770, ruled by megacorporations, home to DNA-modified human-animal hybrids.", sortOrder: 2 },
  ]);

  await db.insert(portfolioItems).values([
    {
      title: "Crimson Warrior", cat: "Gameplay Design", year: 2026, date: "2026-02-01",
      desc: "Full game-ready character. High-poly sculpt in ZBrush (68k), baked to 4k maps. Substance Painter textures. Rigged and exported for Unreal Engine 5.",
      tags: ["ZBrush", "Substance", "Game Ready", "UE5 Ready"],
      medium: "3D Character", software: "ZBrush, Blender, Substance Painter",
      link: "https://www.artstation.com/demirunal",
      img: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=700&h=900&fit=crop",
      sortOrder: 0,
    },
    {
      title: "Azure Mage", cat: "Character Design", year: 2026, date: "2026-01-15",
      desc: "Character design from concept sketch to final 3D. Focus on cloth simulation and layered material design for the robe system.",
      tags: ["Modeling", "Rigging", "Cloth Sim"],
      medium: "3D Character", software: "Maya, ZBrush, Marvelous Designer",
      link: "https://www.artstation.com/demirunal",
      img: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=700&h=900&fit=crop",
      sortOrder: 1,
    },
    {
      title: "Shadow Assassin", cat: "Gameplay Design", year: 2025, date: "2025-11-01",
      desc: "Stealth-archetype character. Modular armor system designed for in-game customization. Custom skin shader in Unreal 5.",
      tags: ["Modeling", "Animation", "Modular", "Game Ready"],
      medium: "3D Character", software: "ZBrush, Maya, Unreal Engine 5",
      link: "https://www.artstation.com/demirunal",
      img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=700&h=900&fit=crop",
      sortOrder: 2,
    },
    {
      title: "Sakura Knight", cat: "Character Design", year: 2025, date: "2025-08-01",
      desc: "Fantasy warrior combining Japanese armor aesthetics with a stylized Western silhouette.",
      tags: ["3D Modeling", "Concept Art", "Fantasy"],
      medium: "Concept + 3D", software: "Procreate, ZBrush, Blender",
      link: "https://www.artstation.com/demirunal",
      img: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=700&h=900&fit=crop",
      sortOrder: 3,
    },
    {
      title: "Neon Hero", cat: "Level Design", year: 2025, date: "2025-05-01",
      desc: "Cyberpunk environment layout study. Level flow, pacing and landmark design for a vertical city district in Unreal Engine 5.",
      tags: ["Level Design", "UE5", "Environment", "Layout"],
      medium: "Level Design", software: "Unreal Engine 5, Blender",
      link: "https://www.artstation.com/demirunal",
      img: "https://images.unsplash.com/photo-1536329583941-14287ec6fc4e?w=700&h=900&fit=crop",
      sortOrder: 4,
    },
  ]);

  await db.insert(sketches).values([
    { year: 2026, date: "2026-02-10", label: "2026.02 — figure study", desc: "Anatomy and proportion study. Morning session.", img: null, colorHex: "#151010", sortOrder: 0 },
    { year: 2026, date: "2026-02-05", label: "2026.02 — loose form", desc: "Gestural lines, no reference.", img: null, colorHex: "#0e1218", sortOrder: 1 },
    { year: 2026, date: "2026-01-20", label: "2026.01 — environment", desc: "Quick environment thumbnail.", img: null, colorHex: "#10140e", sortOrder: 2 },
    { year: 2026, date: "2026-03-01", label: "2026.03 — quick sketch", desc: "Quick warm-up sketch.", img: null, colorHex: "#151518", sortOrder: 3 },
    { year: 2025, date: "2025-11-11", label: "2025.11 — anatomy", desc: "30-day anatomy challenge, day 11.", img: null, colorHex: "#181010", sortOrder: 4 },
    { year: 2025, date: "2025-04-01", label: "2025.04 — gesture", desc: "5-minute gesture session.", img: null, colorHex: "#0e0e18", sortOrder: 5 },
    { year: 2025, date: "2025-03-01", label: "2025.03 — doodle", desc: "Random doodle between classes.", img: null, colorHex: "#14100e", sortOrder: 6 },
    { year: 2025, date: "2025-08-01", label: "2025.08 — creature", desc: "Creature concept, no ref.", img: null, colorHex: "#0e1818", sortOrder: 7 },
  ]);

  await db.insert(worldbuildingEntries).values([
    {
      year: 2025, date: "Jan 15, 2025", cat: "Cities",
      title: "The Chronicles of Aethermoor — Chapter 1: The Awakening",
      excerpt: "In the realm where magic and technology intertwine, a young warrior discovers their destiny among the floating islands of Aethermoor...",
      chips: ["Aethermoor", "Lore", "Cities"],
      img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=380&fit=crop",
      sortOrder: 0,
    },
    {
      year: 2025, date: "Jan 10, 2025", cat: "Characters",
      title: "Character Spotlight: Crimson Warrior — Origins",
      excerpt: "Exploring the backstory and design process of the Crimson Warrior, from concept sketches to final 3D model...",
      chips: ["Character Design", "Process"],
      img: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=600&h=380&fit=crop",
      sortOrder: 1,
    },
    {
      year: 2024, date: "Dec 20, 2024", cat: "Lore",
      title: "The Azure Kingdom: A Place Between Worlds",
      excerpt: "A kingdom that floats in the lower Drift, permanently overcast. The Azure comes from bioluminescent moss covering every surface...",
      chips: ["World Lore", "Geography", "Magic"],
      img: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&h=380&fit=crop",
      sortOrder: 2,
    },
    {
      year: 2024, date: "Nov 15, 2024", cat: "Lore",
      title: "The Shadow Guild — Secrets and Betrayal",
      excerpt: "We do not trade in secrets. We trade in the space between what is known and what must never be found...",
      chips: ["Factions", "Story"],
      img: "https://images.unsplash.com/photo-1536329583941-14287ec6fc4e?w=600&h=380&fit=crop",
      sortOrder: 3,
    },
    {
      year: 2024, date: "Oct 08, 2024", cat: "Events",
      title: "Sakura Festival: Cultural Traditions of the East",
      excerpt: "The annual Sakura Festival celebrates the harmony between warriors and nature — a tradition spanning millennia...",
      chips: ["Culture", "Festivals"],
      img: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&h=380&fit=crop",
      sortOrder: 4,
    },
    {
      year: 2024, date: "Aug 14, 2024", cat: "Characters",
      title: "Moonlight Archer — The Last of Her Order",
      excerpt: "Under the full moon, ancient pacts are renewed. She carries the last seal of the Moonlight Covenant...",
      chips: ["Character", "Mythology"],
      img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=380&fit=crop",
      sortOrder: 5,
    },
  ]);

  await db.insert(games).values([
    {
      title: "The Abyss", status: "In Development — Solo", engine: "Unreal Engine 5",
      desc: "A first-person psychological horror anomaly game. You are trapped in a looping abandoned facility — each iteration is subtly wrong. Find what changed.",
      tags: ["Horror", "First-Person", "Anomaly", "Solo Dev", "Steam"],
      feats: ["Sprint + slide system", "Flashlight mechanic", "Door interaction", "Object examination", "Persistent fear state", "Volumetric atmospheric fog"],
      target: "Steam — June 2026",
      img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&h=500&fit=crop",
      sortOrder: 0,
    },
    {
      title: "Group Project — Game 2", status: "In Development — Team", engine: "Unreal Engine 5",
      desc: "4-person school project. All Unreal Engine work and gameplay programming handled solo.",
      tags: ["School", "Group", "UE5"],
      feats: ["TBD"],
      target: "June 2026",
      img: "https://images.unsplash.com/photo-1536329583941-14287ec6fc4e?w=900&h=500&fit=crop",
      sortOrder: 1,
    },
  ]);

  await db.insert(aboutContent).values([
    {
      whoIAmParagraphs: [
        "I'm Ege Demir Ünal, known online as Tetsunaru. Game Design student based in Istanbul, graduating June 2026.",
        "I work at the intersection of storytelling and gameplay. My goal is to make games that feel alive — worlds with weight, mechanics that serve the narrative, experiences that linger long after the screen goes dark.",
        "Currently building The Abyss, a horror anomaly game in Unreal Engine 5. This site is my personal archive — game projects, 3D work, sketches, and the worlds I build for no one but myself.",
      ],
      tools: ["Unreal Engine 5", "Blueprint", "Blender", "ZBrush", "Maya", "Substance Painter", "Obsidian", "HacknPlan"],
    },
  ]);

  await db.insert(timelineEntries).values([
    { year: "2024", text: "Built Exit 8 clone in Unreal Engine. First complete Blueprint project, self-taught.", sortOrder: 0 },
    { year: "2025", text: "Pivoted from pure 3D art to Game Design. Started The Abyss.", sortOrder: 1 },
    { year: "2026", text: "Final year. Shipping The Abyss on Steam. Targeting Gameplay Designer roles.", sortOrder: 2 },
    { year: "→", text: "Post-grad: indie studio, shipped titles, CDPR long-term goal.", sortOrder: 3 },
  ]);

  await db.insert(siteSettings).values([
    {
      name: "Ege Demir Ünal",
      handle: "/ TETSUNARU",
      jpLabel: "鉄なる — 創造者",
      footerLine: "Game Designer\nUnreal Engine 5\nIstanbul, TR — 2026",
      contactEmail: "egedemirunal@gmail.com",
      twitterUrl: "https://x.com/TetsuUnaru",
      artstationUrl: "https://www.artstation.com/demirunal",
      linkedinUrl: "https://www.linkedin.com/in/egedemirunal/",
      instagramUrl: "https://www.instagram.com/demirunal3d/",
    },
  ]);

  console.log("Seed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
