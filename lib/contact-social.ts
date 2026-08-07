export const CONTACT_SOCIAL_FIELDS = [
  { key: "artstationUrl", label: "ArtStation" },
  { key: "linkedinUrl", label: "LinkedIn" },
  { key: "instagramUrl", label: "Instagram" },
  { key: "githubUrl", label: "GitHub" },
  { key: "twitterUrl", label: "X / Twitter" },
] as const;

type SocialField = (typeof CONTACT_SOCIAL_FIELDS)[number]["key"];

export type ContactSocialSettings = Record<SocialField, string> & {
  contactEmail: string;
};

export type ContactSocialLink = {
  key: "email" | SocialField;
  label: string;
  value: string;
  href: string;
  external: boolean;
};

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function resolveContactSocialLinks(settings: ContactSocialSettings): ContactSocialLink[] {
  const links: ContactSocialLink[] = [];
  const email = settings.contactEmail.trim();

  if (validEmail(email)) {
    links.push({ key: "email", label: "Email", value: email, href: `mailto:${email}`, external: false });
  }

  for (const field of CONTACT_SOCIAL_FIELDS) {
    const href = settings[field.key].trim();
    if (!validWebUrl(href)) continue;

    links.push({
      key: field.key,
      label: field.label,
      value: new URL(href).hostname.replace(/^www\./, ""),
      href,
      external: true,
    });
  }

  return links;
}
