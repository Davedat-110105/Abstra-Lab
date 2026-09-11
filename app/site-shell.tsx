"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { discordHref } from "./content";

const navItems = [
  ["Pioneer", "/pioneer"],
  ["Launch Canada", "/launch-canada"],
  ["Events", "/events"],
  ["Posts", "/posts"],
  ["About", "/about"],
  ["Sponsorship", "/sponsorship"],
  ["Join", "/join"],
  ["Contact us", "/contact"],
  ["Login", "/accounts/login"],
] as const;

function ExternalOrLink({
  href,
  children,
  onClick,
}: Readonly<{ href: string; children: React.ReactNode; onClick?: () => void }>) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} onClick={onClick}>
      {children}
    </Link>
  );
}

export function SiteShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("js");
    document.body.classList.toggle("nav-open", navOpen);
    return () => document.body.classList.remove("nav-open");
  }, [navOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className={`sx-header${scrolled ? " is-scrolled" : ""}`} data-site-header>
        <Link className="sx-logo" href="/">
          Astra Labs
        </Link>
        <button
          className="sx-menu-btn"
          type="button"
          data-nav-toggle
          aria-expanded={navOpen}
          aria-controls="site-nav"
          aria-label={navOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setNavOpen((open) => !open)}
        >
          <span className="sx-menu-btn__bar" aria-hidden="true" />
          <span className="sx-menu-btn__bar" aria-hidden="true" />
          <span className="sx-menu-btn__bar" aria-hidden="true" />
        </button>
      </header>

      <nav className="nav-drawer" id="site-nav" data-site-nav hidden={!navOpen} aria-label="Main navigation">
        <div className="nav-drawer__inner">
          <ul className="nav-drawer__list">
            {navItems.map(([label, href]) => (
              <li key={href}>
                <Link href={href} onClick={() => setNavOpen(false)}>
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <ExternalOrLink href={discordHref} onClick={() => setNavOpen(false)}>
                Discord
              </ExternalOrLink>
            </li>
          </ul>
          <p className="nav-drawer__meta">Seneca Polytechnic · Launch Canada 2026</p>
        </div>
      </nav>

      <main id="main">{children}</main>

      <footer className="sx-footer">
        <div className="sx-footer__grid">
          <div className="sx-footer__brand">
            <Link className="sx-logo" href="/">
              Astra Labs
            </Link>
            <p>Student rocketry at Seneca Polytechnic. Building Pioneer for Launch Canada 2026.</p>
          </div>
          <div className="sx-footer__col">
            <h4>Build</h4>
            <Link href="/pioneer">Pioneer</Link>
            <Link href="/launch-canada">Launch Canada</Link>
            <Link href="/events">Events</Link>
            <Link href="/posts">Posts</Link>
          </div>
          <div className="sx-footer__col">
            <h4>Club</h4>
            <Link href="/about">About</Link>
            <Link href="/members">Members</Link>
            <Link href="/join">Join</Link>
            <Link href="/sponsorship">Sponsorship</Link>
            <Link href="/contact">Contact us</Link>
          </div>
          <div className="sx-footer__col">
            <h4>Members</h4>
            <Link href="/accounts/signup">Sign up</Link>
            <Link href="/accounts/login">Login</Link>
            <ExternalOrLink href={discordHref}>Discord</ExternalOrLink>
          </div>
        </div>
        <div className="sx-footer__base">
          <span>Astra Labs · Seneca Polytechnic</span>
          <span>Pioneer / Launch Canada 2026</span>
        </div>
      </footer>
    </>
  );
}
