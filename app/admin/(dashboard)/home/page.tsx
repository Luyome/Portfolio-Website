import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { games, heroButtons, homeContentSelections, homeHeroSlides, homeMapPreview, homeMapPreviewPins, homeShowcase, homeSkills, mapLocations, models3d, portfolioItems, services, sketches, worldbuildingEntries, worldMaps } from "@/db/schema";
import { getSiteSettings } from "@/lib/site-settings";
import { createHeroButton, createHomeHeroSlide, createHomeShowcaseItem, deleteHeroButton, deleteHomeHeroSlide, deleteHomeShowcaseItem, saveHomeCapabilities, saveHomeContentSelections, saveHomeMapPreview, saveHomeSkills, saveHomeStats, updateHeroButton, updateHomeHeroSlide, updateHomeSettings, updateHomeShowcaseItem } from "@/lib/actions/home";
import DeleteButton from "@/components/admin/DeleteButton";
import HeroLinkPicker from "@/components/admin/HeroLinkPicker";
import OptionPicker from "@/components/admin/OptionPicker";
import NumberPicker from "@/components/admin/NumberPicker";
import ResizableTh from "@/components/admin/ResizableTh";
import HomeHeroForm from "@/components/admin/HomeHeroForm";
import HeroSlidesPanel from "@/components/admin/HeroSlidesPanel";
import ShowcaseImagesPanel from "@/components/admin/ShowcaseImagesPanel";
import SaveButton from "@/components/admin/SaveButton";
import HomeCurationPanel, { HomeSkillsPanel } from "@/components/admin/HomeCurationPanel";
import { getPageAppearance, pageAppearanceVars } from "@/lib/page-appearance";
import { getHomeProductionStats } from "@/lib/home-data";

const STYLE_OPTIONS = [{ label: "Primary", value: "primary" }, { label: "Ghost", value: "ghost" }];
const SECTION_LABELS = ["Identity Hero", "Selected Work", "Capabilities / Focus Areas", "Skills + Production Stats", "KRUPNI Map Preview", "Worldbuilding Highlights", "Latest Dispatches", "Contact + Social"];

export default async function AdminHomePage() {
  const [settings, buttons, serviceRows, appearance, heroSlideRows, showcaseRows, selections, skillRows, stats, maps, previewRows, previewPins, pins, portfolio, sketchRows, modelRows, worldRows, gameRows] = await Promise.all([
    getSiteSettings(), db.select().from(heroButtons).orderBy(asc(heroButtons.sortOrder)), db.select().from(services), getPageAppearance("home"),
    db.select().from(homeHeroSlides).orderBy(asc(homeHeroSlides.sortOrder)), db.select().from(homeShowcase).orderBy(asc(homeShowcase.sortOrder)),
    db.select().from(homeContentSelections).orderBy(asc(homeContentSelections.sortOrder), asc(homeContentSelections.id)), db.select().from(homeSkills).orderBy(asc(homeSkills.sortOrder), asc(homeSkills.id)), getHomeProductionStats(),
    db.select().from(worldMaps).orderBy(asc(worldMaps.sortOrder), asc(worldMaps.id)), db.select().from(homeMapPreview).where(eq(homeMapPreview.id, 1)), db.select().from(homeMapPreviewPins).orderBy(asc(homeMapPreviewPins.sortOrder), asc(homeMapPreviewPins.id)), db.select().from(mapLocations).orderBy(asc(mapLocations.sortOrder), asc(mapLocations.id)),
    db.select({ id: portfolioItems.id, label: portfolioItems.title }).from(portfolioItems).orderBy(asc(portfolioItems.sortOrder)), db.select({ id: sketches.id, label: sketches.label }).from(sketches).orderBy(asc(sketches.sortOrder)), db.select({ id: models3d.id, label: models3d.label }).from(models3d).orderBy(asc(models3d.sortOrder)), db.select({ id: worldbuildingEntries.id, label: worldbuildingEntries.title }).from(worldbuildingEntries).orderBy(asc(worldbuildingEntries.sortOrder)), db.select({ id: games.id, label: games.title }).from(games).orderBy(asc(games.sortOrder)),
  ]);
  const contentCandidates = [...portfolio.map((r)=>({key:`portfolio:${r.id}`,label:r.label,meta:"Portfolio"})),...sketchRows.map((r)=>({key:`sketch:${r.id}`,label:r.label,meta:"2D Work"})),...modelRows.map((r)=>({key:`model3d:${r.id}`,label:r.label,meta:"3D Work"})),...worldRows.map((r)=>({key:`worldbuilding:${r.id}`,label:r.label,meta:"Worldbuilding"})),...gameRows.map((r)=>({key:`game:${r.id}`,label:r.label,meta:"Game"}))];
  const keysFor = (section: string) => selections.filter((r)=>r.section===section).map((r)=>r.portfolioId?`portfolio:${r.portfolioId}`:r.sketchId?`sketch:${r.sketchId}`:r.model3dId?`model3d:${r.model3dId}`:r.worldbuildingEntryId?`worldbuilding:${r.worldbuildingEntryId}`:`game:${r.gameId}`);
  const preview = previewRows[0];
  const selectedMapPins = pins.filter((pin)=>pin.mapId===preview?.mapId);
  return <div>
    <div className="adm-title">Home</div><p className="adm-sub">Manage legacy Home content and the ordered Sprint 3 Home configuration.</p>
    <nav className="adm-home-index" aria-label="Home sections">{SECTION_LABELS.map((label,index)=><a key={label} href={`#home-section-${index+1}`}><span>0{index+1}</span>{label}</a>)}</nav>
    <div id="home-section-1" className="adm-home-anchor"><p className="adm-sub" style={{marginTop:0}}>1. Identity Hero — legacy-compatible controls</p></div>
    <HomeHeroForm action={updateHomeSettings} settings={settings} pageVars={pageAppearanceVars(appearance)} />
    <p className="adm-sub" style={{marginTop:48}}>Hero Buttons</p>
    <div className="adm-table-wrap"><table className="adm-table"><thead><tr><ResizableTh>Label / Link</ResizableTh><ResizableTh>Style</ResizableTh><ResizableTh>Order</ResizableTh><th>Actions</th></tr></thead><tbody>{buttons.map((b)=>{const updateWithId=updateHeroButton.bind(null,b.id);const formId=`hero-form-${b.id}`;return <tr key={b.id}><td><form id={formId} action={updateWithId}><HeroLinkPicker labelName="label" hrefName="href" defaultLabel={b.label} defaultHref={b.href}/></form></td><td><OptionPicker name="style" options={STYLE_OPTIONS} defaultValue={b.style} formId={formId}/></td><td><NumberPicker name="sortOrder" defaultValue={b.sortOrder} formId={formId}/></td><td><div className="adm-actions"><SaveButton formId={formId} style={{padding:"8px 14px"}}/><form action={deleteHeroButton}><input type="hidden" name="id" value={b.id}/><DeleteButton confirmText={`Delete "${b.label}"?`}/></form></div></td></tr>})}</tbody></table></div>
    <p className="adm-sub" style={{marginTop:32}}>Add Hero Button</p><form action={createHeroButton} className="adm-form"><div className="adm-field"><label>Page</label><HeroLinkPicker labelName="label" hrefName="href"/></div><div className="adm-field"><label>Style</label><OptionPicker name="style" options={STYLE_OPTIONS} defaultValue="primary"/></div><div className="adm-field"><label>Sort Order</label><NumberPicker name="sortOrder" defaultValue={buttons.length}/></div><button type="submit" className="adm-btn">Add Button</button></form>
    <HeroSlidesPanel slides={heroSlideRows} createAction={createHomeHeroSlide} updateAction={updateHomeHeroSlide} deleteAction={deleteHomeHeroSlide}/>
    <ShowcaseImagesPanel items={showcaseRows} createAction={createHomeShowcaseItem} updateAction={updateHomeShowcaseItem} deleteAction={deleteHomeShowcaseItem}/>
    <div id="home-section-2" className="adm-home-anchor"><HomeCurationPanel title="Selected Work" description="Ordered links to existing work. The legacy Showcase above remains active for the current public Home." limit={6} candidates={contentCandidates} initialKeys={keysFor("featured_work")} action={saveHomeContentSelections}><input type="hidden" name="section" value="featured_work"/></HomeCurationPanel></div>
    <div id="home-section-3" className="adm-home-anchor"><HomeCurationPanel title="Capabilities / Focus Areas" description="Choose and order 3–4 existing Services." limit={4} candidates={serviceRows.map((r)=>({key:`id:${r.id}`,label:r.title,meta:"Service"}))} initialKeys={serviceRows.filter((r)=>r.isHomeVisible).sort((a,b)=>a.sortOrder-b.sortOrder).map((r)=>`id:${r.id}`)} action={saveHomeCapabilities}/><Link href="/admin/services" className="adm-home-related">Manage Service records →</Link></div>
    <div id="home-section-4" className="adm-home-anchor"><HomeSkillsPanel initial={skillRows.map(({label,isVisible})=>({label,isVisible}))} action={saveHomeSkills}/><HomeCurationPanel title="Production Stats" description="Counts are automatic. Stories & Devlogs and Published Entries remain unavailable because no valid source or publication definition exists." limit={4} candidates={stats.map((s)=>({key:`value:${s.key}`,label:s.label,meta:s.available?`${s.count??0} automatic`:"Unavailable",disabled:!s.available}))} initialKeys={stats.filter((s)=>s.isVisible).map((s)=>`value:${s.key}`)} action={saveHomeStats}/></div>
    <div id="home-section-5" className="adm-home-anchor"><HomeCurationPanel title="KRUPNI Map Preview" description="Choose and save a map, then select up to 5 of its existing markers. Coordinates remain in Map Admin." limit={5} candidates={selectedMapPins.map((p)=>({key:`id:${p.id}`,label:p.name,meta:"Existing marker"}))} initialKeys={previewPins.map((p)=>`id:${p.locationId}`)} action={saveHomeMapPreview}><div className="adm-home-map-config"><label htmlFor="home-map">Preview map</label><select id="home-map" name="mapId" defaultValue={preview?.mapId??""}><option value="">No map selected</option>{maps.map((m)=><option key={m.id} value={m.id}>{m.title}</option>)}</select><label className="adm-home-check"><input type="checkbox" name="isVisible" defaultChecked={preview?.isVisible??false}/> Visible on Home</label></div></HomeCurationPanel><Link href="/admin/worldbuilding/map" className="adm-home-related">Open Map Admin →</Link></div>
    <div id="home-section-6" className="adm-home-anchor"><HomeCurationPanel title="Worldbuilding Highlights" description="Ordered links to existing Worldbuilding records." limit={3} candidates={worldRows.map((r)=>({key:`worldbuilding:${r.id}`,label:r.label,meta:"Worldbuilding"}))} initialKeys={keysFor("worldbuilding_highlight")} action={saveHomeContentSelections}><input type="hidden" name="section" value="worldbuilding_highlight"/></HomeCurationPanel></div>
    <div id="home-section-7" className="adm-home-anchor"><HomeCurationPanel title="Latest Dispatches" description="Curate existing content types only. No Story, Devlog, or Article model is created here." limit={4} candidates={contentCandidates} initialKeys={keysFor("latest_dispatch")} action={saveHomeContentSelections}><input type="hidden" name="section" value="latest_dispatch"/></HomeCurationPanel></div>
    <section id="home-section-8" className="adm-home-panel adm-home-anchor"><div className="adm-home-panel-head"><div><h2>Contact + Social</h2><p>Contact email and social profiles use canonical Site Settings storage.</p></div></div><Link href="/admin/settings" className="adm-btn">Manage Site Settings</Link></section>
  </div>;
}
