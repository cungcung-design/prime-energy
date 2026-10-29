type SectionLabelProps = {
  children: string;
  tone?: "dark" | "light";
};

export function SectionLabel({ children, tone = "dark" }: SectionLabelProps) {
  const onLight = tone === "light";

  return (
    <div className="flex items-center gap-[10px]">
      <span
        aria-hidden="true"
        className={`size-[6px] shrink-0 ${onLight ? "bg-ink" : "bg-lime"}`}
      />
      <p className={`font-mono text-[11px] ${onLight ? "text-ink" : "text-mist"}`}>
        {children}
      </p>
    </div>
  );
}
