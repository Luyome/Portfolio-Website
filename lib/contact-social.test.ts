import assert from "node:assert/strict";
import test from "node:test";
import type { ContactSocialSettings } from "./contact-social";

const { resolveContactSocialLinks } = await import(
  new URL("./contact-social.ts", import.meta.url).href
) as typeof import("./contact-social");

const emptySettings = (): ContactSocialSettings => ({
  contactEmail: "",
  artstationUrl: "",
  linkedinUrl: "",
  instagramUrl: "",
  githubUrl: "",
  twitterUrl: "",
});

test("configured contact and social links preserve their correct destinations", () => {
  const links = resolveContactSocialLinks({
    ...emptySettings(),
    contactEmail: "hello@example.com",
    artstationUrl: "https://www.artstation.com/example",
    githubUrl: "https://github.com/example",
  });

  assert.deepEqual(links.map(({ label, href }) => ({ label, href })), [
    { label: "Email", href: "mailto:hello@example.com" },
    { label: "ArtStation", href: "https://www.artstation.com/example" },
    { label: "GitHub", href: "https://github.com/example" },
  ]);
});

test("partial and empty settings degrade without fabricated links", () => {
  assert.deepEqual(resolveContactSocialLinks(emptySettings()), []);
  assert.deepEqual(resolveContactSocialLinks({ ...emptySettings(), linkedinUrl: "https://linkedin.com/in/example" }).map((link) => link.label), ["LinkedIn"]);
});

test("invalid email and URL schemes are omitted", () => {
  const links = resolveContactSocialLinks({
    ...emptySettings(),
    contactEmail: "not-an-email",
    artstationUrl: "javascript:alert(1)",
    instagramUrl: "/relative-profile",
    twitterUrl: "https://x.com/example",
  });

  assert.deepEqual(links.map((link) => link.label), ["X / Twitter"]);
});
