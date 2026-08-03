"use client";

import { useRouter } from "next/navigation";
import { downloadUrl } from "@/lib/download-url";

export default function CVViewer({ img }: { img: string | null }) {
  const router = useRouter();

  if (!img) {
    return <div className="cv-empty">CV not uploaded yet.</div>;
  }

  const isPdf = img.toLowerCase().endsWith(".pdf");

  return (
    <div
      className="gm-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) router.back();
      }}
    >
      <div className="gm-panel cv-panel">
        <div className="gm-img-side">
          <div className="gm-img-scroll">
            {isPdf ? (
              <iframe src={img} className="cv-pdf-frame" title="CV" />
            ) : (
              <div className="gm-img-list">
                <img src={img} alt="CV" />
              </div>
            )}
          </div>
          <div className="gm-nav">
            <a href={downloadUrl(img, "CV")} className="gm-nav-btn">Download ↓</a>
          </div>
        </div>
      </div>
    </div>
  );
}
