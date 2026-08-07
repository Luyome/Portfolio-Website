"use client";

import { useActionState, useMemo, useState } from "react";
import FormError from "./FormError";
import SaveButton from "./SaveButton";
import type { HomeAdminActionState } from "@/lib/actions/home";

type Item = { key: string; label: string; meta?: string; disabled?: boolean };
type Action = (state: HomeAdminActionState, formData: FormData) => Promise<HomeAdminActionState>;

export default function HomeCurationPanel({ title, description, limit, candidates, initialKeys, action, fieldName = "items", children }: {
  title: string;
  description: string;
  limit: number;
  candidates: Item[];
  initialKeys: string[];
  action: Action;
  fieldName?: string;
  children?: React.ReactNode;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const [keys, setKeys] = useState(initialKeys);
  const [choice, setChoice] = useState("");
  const byKey = useMemo(() => new Map(candidates.map((item) => [item.key, item])), [candidates]);
  const available = candidates.filter((item) => !keys.includes(item.key) && !item.disabled);

  function move(index: number, delta: number) {
    const next = [...keys];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setKeys(next);
  }

  return (
    <section className="adm-home-panel" aria-labelledby={`home-${title.replaceAll(" ", "-").toLowerCase()}`}>
      <div className="adm-home-panel-head">
        <div>
          <h2 id={`home-${title.replaceAll(" ", "-").toLowerCase()}`}>{title}</h2>
          <p>{description}</p>
        </div>
        <span className="adm-home-limit">{keys.length} / {limit}</span>
      </div>
      <form action={formAction} className="adm-home-form">
        <FormError message={state?.error} />
        {state?.success && <p className="adm-success" role="status">{state.success}</p>}
        {children}
        <input type="hidden" name={fieldName} value={JSON.stringify(keys.map((key) => {
          const [type, id] = key.split(":");
          return type === "id" ? Number(id) : type === "value" ? id : { type, id: Number(id) };
        }))} />
        {keys.length ? (
          <ol className="adm-home-selection">
            {keys.map((key, index) => {
              const item = byKey.get(key);
              return <li key={key}>
                <span className="adm-home-order">{index + 1}</span>
                <span className="adm-home-item"><strong>{item?.label ?? "Unavailable item"}</strong>{item?.meta && <small>{item.meta}</small>}</span>
                <div className="adm-home-controls">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${item?.label} up`}>Up</button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === keys.length - 1} aria-label={`Move ${item?.label} down`}>Down</button>
                  <button type="button" className="danger" onClick={() => setKeys(keys.filter((value) => value !== key))}>Remove</button>
                </div>
              </li>;
            })}
          </ol>
        ) : <p className="adm-home-empty" role="status">Nothing selected yet. Choose an available item below.</p>}
        <div className="adm-home-add">
          <label htmlFor={`add-${title.replaceAll(" ", "-").toLowerCase()}`}>Add existing item</label>
          <div>
            <select id={`add-${title.replaceAll(" ", "-").toLowerCase()}`} value={choice} onChange={(event) => setChoice(event.target.value)} disabled={keys.length >= limit || available.length === 0}>
              <option value="">{available.length ? "Choose…" : "No eligible items available"}</option>
              {available.map((item) => <option key={item.key} value={item.key}>{item.label}{item.meta ? ` — ${item.meta}` : ""}</option>)}
            </select>
            <button type="button" className="adm-btn" disabled={!choice || keys.length >= limit} onClick={() => { setKeys([...keys, choice]); setChoice(""); }}>Add</button>
          </div>
        </div>
        <SaveButton />
      </form>
    </section>
  );
}

export function HomeSkillsPanel({ initial, action }: { initial: { label: string; isVisible: boolean }[]; action: Action }) {
  const [state, formAction] = useActionState(action, undefined);
  const [items, setItems] = useState(initial);
  return <section className="adm-home-panel" aria-labelledby="home-skills">
    <div className="adm-home-panel-head"><div><h2 id="home-skills">Skills + Production Stats</h2><p>Maintain up to 6 concise Home-only skills. Counts are configured separately below.</p></div><span className="adm-home-limit">{items.length} / 6</span></div>
    <form action={formAction} className="adm-home-form">
      <FormError message={state?.error} />{state?.success && <p className="adm-success" role="status">{state.success}</p>}
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      {items.length ? <ol className="adm-home-selection">{items.map((item, index) => <li key={index}>
        <span className="adm-home-order">{index + 1}</span><label className="adm-home-skill"><span className="sr-only">Skill {index + 1}</span><input value={item.label} onChange={(e) => setItems(items.map((row, i) => i === index ? {...row, label: e.target.value} : row))} required /></label>
        <label className="adm-home-check"><input type="checkbox" checked={item.isVisible} onChange={(e) => setItems(items.map((row, i) => i === index ? {...row, isVisible: e.target.checked} : row))} /> Visible</label>
        <div className="adm-home-controls"><button type="button" disabled={index === 0} onClick={() => { const n=[...items]; [n[index-1],n[index]]=[n[index],n[index-1]]; setItems(n); }}>Up</button><button type="button" disabled={index === items.length-1} onClick={() => { const n=[...items]; [n[index+1],n[index]]=[n[index],n[index+1]]; setItems(n); }}>Down</button><button type="button" className="danger" onClick={() => setItems(items.filter((_,i)=>i!==index))}>Remove</button></div>
      </li>)}</ol> : <p className="adm-home-empty">No Home Skills yet. Add a short skill label.</p>}
      <div className="adm-home-add"><button type="button" className="adm-btn" disabled={items.length >= 6} onClick={() => setItems([...items,{label:"",isVisible:true}])}>Add Skill</button></div><SaveButton />
    </form>
  </section>;
}
