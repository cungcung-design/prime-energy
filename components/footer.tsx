import { Icon } from "@/components/icon";
import { footerGroups } from "@/lib/content";

const socials = ["INSTAGRAM ↗", "TIKTOK ↗", "YOUTUBE ↗"];

export function Footer() {
  return (
    <footer id="support" className="bg-ink">
      <div className="flex w-full flex-col gap-10 px-4 pt-12 pb-7 sm:px-8 lg:gap-12 lg:px-16 lg:pt-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex w-full flex-col gap-5 lg:w-[460px]">
            <p className="font-display text-[62px] leading-none font-extrabold text-paper italic">
              PRIME
            </p>
            <p className="text-[15px] text-mist">Leave ordinary behind</p>
            <div className="flex flex-wrap gap-x-[22px] gap-y-2">
              {socials.map((label) => (
                <a key={label} href="#connect" className="font-mono text-[10px] text-paper">
                  {label}
                </a>
              ))}
            </div>
          </div>
          {footerGroups.map((group) => (
            <div
              key={group.title}
              id={group.title === "SUPPORT" ? "support" : group.title === "CONNECT" ? "connect" : undefined}
              className="flex w-full flex-col gap-4 lg:w-[200px]"
            >
              <p className="font-mono text-[10px] text-ash">{group.title}</p>
              {group.links.map((link) => (
                <a key={link.label} href={link.href} className="text-[12px] text-mist">
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 border-y border-line py-6 sm:flex-row sm:items-center sm:justify-between lg:py-[26px]">
          <p className="font-display text-[clamp(32px,8vw,100px)] leading-none font-extrabold text-paper lg:whitespace-nowrap">
            ENERGY WITHOUT PERMISSION
          </p>
          <span className="hidden sm:block">
            <Icon src="/icons/arrow-up-right-large.svg" width={64} height={64} />
          </span>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="font-mono text-[9px] text-ash">
            © 2026 PRIME ENERGY. ALL RIGHTS RESERVED.
          </p>
          <div className="flex flex-wrap gap-x-[26px] gap-y-2 text-[10px] text-ash">
            <a id="privacy" href="/privacy">
              Privacy policy
            </a>
            <a href="/terms">Terms of use</a>
            <a href="/privacy">Cookie preferences</a>
          </div>
          <p className="font-mono text-[10px] text-mist lg:shrink-0">UNITED STATES / USD ↓</p>
        </div>
      </div>
    </footer>
  );
}
