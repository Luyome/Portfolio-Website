import Link from "next/link";

export default function BackToSiteButton({ fixed = false }: { fixed?: boolean }) {
  return (
    <Link href="/" className={`adm-exit-btn${fixed ? " fixed" : ""}`}>
      <span className="arr">←</span> Back to Site
    </Link>
  );
}
