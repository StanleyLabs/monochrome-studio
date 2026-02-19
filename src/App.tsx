import { useEffect, useMemo, useRef, useState } from "react";

function cn(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ");
}

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">{children}</div>;
}

function useMouseGlow() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${x}%`);
        el.style.setProperty("--my", `${y}%`);
      });
    };

    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return ref;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-insetHairline">
      <div className="font-mono text-xs text-fog/70">{label}</div>
      <div className="mt-2 font-display text-xl text-paper">{value}</div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-left shadow-insetHairline",
        "transition hover:bg-white/10"
      )}
      onClick={() => setOpen((s) => !s)}
      aria-expanded={open}
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="font-display text-lg text-paper">{q}</div>
          <div className={cn("mt-2 text-sm leading-relaxed text-fog/85", !open && "hidden")}>
            {a}
          </div>
        </div>
        <div className="mt-1 font-mono text-xs text-electric">{open ? "−" : "+"}</div>
      </div>
    </button>
  );
}

export default function App() {
  const glowRef = useMouseGlow();
  const [plan, setPlan] = useState<"starter" | "pro" | "studio">("pro");

  const plans = useMemo(
    () =>
      ({
        starter: {
          name: "Starter",
          price: "$0",
          blurb: "For building momentum.",
          bullets: ["1 landing page", "Basic SEO", "Responsive UI", "Email capture"],
        },
        pro: {
          name: "Pro",
          price: "$19",
          blurb: "For shipping weekly.",
          bullets: ["Components library", "Animations", "Analytics", "A/B-ready"],
        },
        studio: {
          name: "Studio",
          price: "$49",
          blurb: "For teams that care.",
          bullets: ["Design system", "Multi-page", "CMS-ready", "Priority support"],
        },
      }) as const,
    []
  );

  return (
    <div ref={glowRef as any} className="min-h-dvh bg-ink text-paper">
      {/* background glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(900px circle at var(--mx, 20%) var(--my, 15%), rgba(46,242,194,0.20), transparent 55%), radial-gradient(900px circle at 85% 35%, rgba(45,107,255,0.18), transparent 55%)",
        }}
      />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/70 backdrop-blur">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <a className="group inline-flex items-center gap-3" href="#">
              <div className="grid size-9 place-items-center rounded-md bg-graphite shadow-insetHairline">
                <span className="font-mono text-xs text-mint">SL</span>
              </div>
              <div className="leading-tight">
                <div className="font-display text-sm tracking-[0.18em] text-paper">
                  MONOCHROME STUDIO
                </div>
                <div className="font-mono text-[11px] text-fog/80">Interactive landing page sample</div>
              </div>
            </a>
            <nav className="hidden items-center gap-6 sm:flex">
              <a href="#features" className="text-sm text-fog/90 hover:text-paper">
                Features
              </a>
              <a href="#pricing" className="text-sm text-fog/90 hover:text-paper">
                Pricing
              </a>
              <a
                href="#cta"
                className="rounded-md bg-mint px-4 py-2 text-sm font-semibold text-ink hover:bg-mint/90"
              >
                Start free
              </a>
            </nav>
            <a
              href="#cta"
              className="sm:hidden rounded-md bg-mint px-3 py-2 text-sm font-semibold text-ink"
            >
              Start
            </a>
          </div>
        </Container>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="grain absolute inset-0" />
          <Container>
            <div className="relative py-16 sm:py-24">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-fog/80">
                <span className="text-mint">●</span> Zero bloat. Maximum feel.
              </div>

              <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] tracking-tight text-paper sm:text-6xl">
                The simplest landing page that still feels like a product.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-fog/90 sm:text-lg">
                This sample is built with React + Tailwind: crisp UI, microinteractions, and an
                interactive pricing switcher—without a heavyweight animation library.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#cta"
                  className="shimmer inline-flex items-center justify-center rounded-md bg-mint px-6 py-3 text-sm font-semibold text-ink"
                >
                  Start free
                </a>
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center rounded-md border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-paper hover:bg-white/10"
                >
                  See pricing
                </a>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <Stat label="Time to value" value="< 2 min" />
                <Stat label="Bundle mindset" value="Performance" />
                <Stat label="Design" value="Cinematic" />
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {["Lightning-fast UX", "Copy that sells", "Accessible by default", "Delightful details"].map(
                  (x) => (
                    <div
                      key={x}
                      className="shimmer rounded-2xl border border-white/10 bg-white/5 p-6 shadow-insetHairline"
                    >
                      <div className="font-display text-lg text-paper">{x}</div>
                      <div className="mt-2 text-sm leading-relaxed text-fog/85">
                        A simple card with a subtle shimmer border on hover. It feels premium, but
                        it’s just CSS.
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </Container>
        </section>

        <section id="features" className="py-16 sm:py-20">
          <Container>
            <h2 className="font-display text-2xl text-paper sm:text-3xl">Features</h2>
            <p className="mt-2 max-w-2xl text-fog/85">
              A tiny set of interactions that makes the page feel alive.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  t: "Mouse-reactive glow",
                  d: "Background light follows the pointer (throttled via rAF).",
                },
                {
                  t: "Shimmer borders",
                  d: "Pure CSS hover treatment—no images, no SVG filters.",
                },
                {
                  t: "Interactive pricing",
                  d: "Switch plans instantly (works great for demos).",
                },
              ].map((x) => (
                <div
                  key={x.t}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-insetHairline"
                >
                  <div className="font-display text-lg text-paper">{x.t}</div>
                  <div className="mt-2 text-sm leading-relaxed text-fog/85">{x.d}</div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section id="pricing" className="py-16 sm:py-20">
          <Container>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-2xl text-paper sm:text-3xl">Pricing</h2>
                <p className="mt-2 max-w-2xl text-fog/85">
                  Click to switch plans. Everything updates instantly.
                </p>
              </div>

              <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1 shadow-insetHairline">
                {(["starter", "pro", "studio"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setPlan(k)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-semibold transition",
                      plan === k ? "bg-white/10 text-paper" : "text-fog hover:text-paper"
                    )}
                  >
                    {plans[k].name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-insetHairline">
                <div className="font-display text-xl text-paper">{plans[plan].name}</div>
                <div className="mt-2 text-sm text-fog/80">{plans[plan].blurb}</div>
                <div className="mt-6 flex items-end gap-2">
                  <div className="font-display text-5xl text-paper">{plans[plan].price}</div>
                  <div className="pb-2 text-sm text-fog/70">/ month</div>
                </div>
                <ul className="mt-6 space-y-2 text-sm text-fog/85">
                  {plans[plan].bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-[2px] text-mint">▸</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <a
                  id="cta"
                  href="#"
                  className="shimmer mt-8 inline-flex w-full items-center justify-center rounded-md bg-mint px-6 py-3 text-sm font-semibold text-ink"
                >
                  Start {plans[plan].name}
                </a>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-[radial-gradient(700px_circle_at_20%_10%,rgba(46,242,194,0.18),transparent_55%)] p-6 shadow-insetHairline">
                  <div className="font-display text-lg text-paper">FAQ</div>
                  <div className="mt-4 grid gap-3">
                    <FAQItem
                      q="Is this production-ready?"
                      a="Yes—this is intentionally simple. It’s meant to be a clean starting point with great feel and good performance."
                    />
                    <FAQItem
                      q="Can I swap the colors and type?"
                      a="Absolutely. Everything is tailwind tokens + a few tiny utilities."
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-insetHairline">
                  <div className="font-display text-lg text-paper">Form (sample)</div>
                  <form className="mt-4 grid gap-3" onSubmit={(e) => e.preventDefault()}>
                    <input
                      className="h-11 rounded-md border border-white/10 bg-ink/50 px-3 text-paper outline-none ring-mint/40 focus:ring-2"
                      placeholder="Email"
                    />
                    <button className="h-11 rounded-md bg-mint font-semibold text-ink hover:bg-mint/90">
                      Join waitlist
                    </button>
                    <div className="text-xs text-fog/70">No spam. Just product updates.</div>
                  </form>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <footer className="border-t border-white/10 py-10">
          <Container>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-fog/80">
                <div className="font-display tracking-[0.18em] text-paper">MONOCHROME STUDIO</div>
                <div className="mt-1">A deliberately tiny, high-feel landing page.</div>
              <div className="mt-2 text-xs text-fog/60">Stanley Labs</div>
              </div>
              <div className="text-sm text-fog/80">© {new Date().getFullYear()}</div>
            </div>
          </Container>
        </footer>
      </main>
    </div>
  );
}
