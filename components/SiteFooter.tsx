import Link from "next/link";
import { TwitterIcon, ArtStationIcon, LinkedInIcon, InstagramIcon, GithubIcon } from "./SocialIcons";

type SiteSettings = {
  footerLine: string;
  twitterUrl: string;
  artstationUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  githubUrl: string;
};

export default function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer w-full">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-6 py-14 text-center md:px-12">
        <p className="sf-line">{settings.footerLine}</p>
        <div className="flex items-center gap-4">
          {settings.artstationUrl && (
            <a href={settings.artstationUrl} target="_blank" rel="noreferrer" className="sf-social" aria-label="ArtStation">
              <ArtStationIcon />
            </a>
          )}
          {settings.twitterUrl && (
            <a href={settings.twitterUrl} target="_blank" rel="noreferrer" className="sf-social" aria-label="Twitter / X">
              <TwitterIcon />
            </a>
          )}
          {settings.githubUrl && (
            <a href={settings.githubUrl} target="_blank" rel="noreferrer" className="sf-social" aria-label="GitHub">
              <GithubIcon />
            </a>
          )}
          {settings.linkedinUrl && (
            <a href={settings.linkedinUrl} target="_blank" rel="noreferrer" className="sf-social" aria-label="LinkedIn">
              <LinkedInIcon />
            </a>
          )}
          {settings.instagramUrl && (
            <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="sf-social" aria-label="Instagram">
              <InstagramIcon />
            </a>
          )}
        </div>
        <div className="sf-bottom-row">
          <span>© {year}</span>
          <Link href="/admin" className="sf-admin-link">
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
