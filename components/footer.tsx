import { footerGroups } from "@/lib/content";
import Link from "next/link";

const socials = ["INSTAGRAM", "TIKTOK", "YOUTUBE"];

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 py-16 sm:px-8 lg:gap-14 lg:px-16 lg:py-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-[720px] flex-col gap-5">
            <p className="font-display text-[28px] leading-none font-extrabold text-lime italic">PRIME</p>
            <p className="font-display text-[40px] leading-[0.9] font-extrabold sm:text-[56px] lg:text-[72px]">
              ENERGY
              <br />
              <span className="text-lime italic">WITHOUT PERMISSION</span>
            </p>
          </div>
          <div className="flex max-w-[380px] flex-col items-start gap-5">
            <p className="text-[15px] leading-relaxed text-mist">Leave ordinary behind.</p>
            <div className="flex flex-wrap gap-2">
              {socials.map((label) => (
                <a
                  key={label}
                  href="#connect"
                  className="inline-flex h-11 items-center border border-line px-3 font-mono text-[10px] tracking-wide text-paper transition-colors hover:border-lime hover:text-lime"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <nav aria-label="Footer" className="grid border border-line sm:grid-cols-3">
          {footerGroups.map((group, index) => (
            <div
              key={group.title}
              id={group.title === "CONNECT" ? "connect" : undefined}
              className={`flex flex-col gap-1 px-5 py-6 sm:px-7 sm:py-8 ${
                index > 0 ? "border-t border-line sm:border-t-0 sm:border-l" : ""
              }`}
            >
              <p className="font-mono text-[11px] tracking-wide text-ash">{group.title}</p>
              <ul className="mt-2 flex flex-col">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("mailto:") ? (
                      <a
                        href={link.href}
                        className="flex min-h-11 items-center text-[15px] text-mist transition-colors hover:text-lime"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="flex min-h-11 items-center text-[15px] text-mist transition-colors hover:text-lime"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] tracking-wide text-ash">
            © 2026 PRIME ENERGY. ALL RIGHTS RESERVED.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px]">
            <Link id="privacy" href="/privacy" className="text-ash transition-colors hover:text-paper">
              Privacy policy
            </Link>
            <Link href="/terms" className="text-ash transition-colors hover:text-paper">
              Terms of use
            </Link>
            <Link href="/privacy" className="text-ash transition-colors hover:text-paper">
              Cookie preferences
            </Link>
          </div>
          <p className="font-mono text-[10px] tracking-wide text-mist">United States · USD</p>
        </div>
      </div>
    </footer>
  );
}
