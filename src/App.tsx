import { useMemo, useState } from "react";

function cn(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ");
}

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-5 sm:px-10">{children}</div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-5">
      <div className="font-mono text-xs text-black/60">{label}</div>
      <div className="mt-2 font-serif text-2xl text-black/90">{value}</div>
    </div>
  );
}


export default function App() {
  const [tab, setTab] = useState<"studio" | "product" | "systems">("studio");
  const tabs = useMemo(
    () =>
      ({
        studio: {
          title: "Studio-grade landing pages",
          copy: "Editorial typography, sharp hierarchy, and conversion patterns that don’t feel salesy.",
          bullets: [
            "Messaging + structure before pixels",
            "Design system so it scales",
            "Performance + accessibility baked in",
          ],
        },
        product: {
          title: "Product-like UX",
          copy: "Subtle interaction (tabs, toggles, hover states) that makes the page feel alive.",
          bullets: [
            "Micro-interactions that stay fast",
            "Clear states + focus handling",
            "No fragile animation dependencies",
          ],
        },
        systems: {
          title: "Systems, not one-offs",
          copy: "Tokens and components that make future pages painless (and consistent).",
          bullets: ["Type scale + spacing rhythm", "Reusable components", "Simple content editing"],
        },
      }) as const,
    []
  );

  const caseStudies = useMemo(
    () =>
      [
        {
          title: "Boutique hotel launch",
          meta: "Landing + booking flow",
          result: "−22% drop-off",
          body: "Rebuilt the above-the-fold message, simplified the navigation, and tightened the CTA path to booking.",
          bullets: ["Information architecture", "Copy + layout", "Performance pass"],
        },
        {
          title: "Hardware product teaser",
          meta: "Pre-order campaign",
          result: "+31% email capture",
          body: "Designed a single-scroll narrative with proof points, spec callouts, and an ultra-light signup form.",
          bullets: ["Design system", "Interactive sections", "Analytics-ready"],
        },
        {
          title: "Creative studio portfolio",
          meta: "Work + services",
          result: "More qualified leads",
          body: "Built case study templates with consistent structure so every project reads clearly and looks premium.",
          bullets: ["Case study layout", "Component library", "CMS-ready structure"],
        },
      ],
    []
  );

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#fbf7f1]/80 backdrop-blur">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <a href="#" className="inline-flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl border border-black/10 bg-white">
                <span className="font-mono text-xs text-black/70">MS</span>
              </div>
              <div className="leading-tight">
                <div className="font-serif text-base tracking-tight text-black/90">Monochrome Studio</div>
                <div className="font-mono text-[11px] text-black/55">Editorial landing sample</div>
              </div>
            </a>

            <nav className="hidden items-center gap-8 sm:flex">
              <a href="#work" className="underline-sweep text-sm text-black/70 hover:text-black">
                Work
              </a>
              <a href="#approach" className="underline-sweep text-sm text-black/70 hover:text-black">
                Approach
              </a>
              <a
                href="#contact"
                className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-black/90"
              >
                Get in touch
              </a>
            </nav>

            <a href="#contact" className="sm:hidden rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
              Contact
            </a>
          </div>
        </Container>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="grain absolute inset-0" />
          <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(245,158,11,0.10),transparent_55%),radial-gradient(900px_circle_at_85%_20%,rgba(0,0,0,0.06),transparent_55%)]" />

          <Container>
            <div className="relative grid gap-10 py-16 sm:grid-cols-2 sm:items-center sm:py-24">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-4 py-1 font-mono text-xs text-black/60">
                  NEW • designed like print, built like software
                </div>

                <h1 className="mt-6 font-serif text-4xl leading-[1.05] tracking-tight text-black/95 sm:text-6xl">
                  A landing page that feels handcrafted.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-black/70 sm:text-lg">
                  Warm paper. Serious type. Quiet motion. Built to convert without feeling like a funnel.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center rounded-full bg-[#f59e0b] px-6 py-3 text-sm font-semibold text-black hover:bg-[#f59e0b]/90"
                  >
                    Start a project
                  </a>
                  <a
                    href="/deck.html"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white/60 px-6 py-3 text-sm font-semibold text-black/80 hover:bg-white"
                  >
                    View deck
                  </a>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  <Stat label="Deliverable" value="Design system" />
                  <Stat label="Speed" value="Performance" />
                  <Stat label="Outcome" value="Conversion" />
                </div>
              </div>

              <div className="rounded-3xl border border-black/10 bg-white/70 p-6 overflow-hidden">
                <div className="font-mono text-xs text-black/60">What you get</div>
                <div className="mt-3 rounded-2xl border border-black/10 bg-[#0b0d12] p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-xs text-white/70">A clear narrative</div>
                    <div className="rounded-full bg-white/10 px-3 py-1 text-xs">v1</div>
                  </div>
                  <div className="mt-4 font-serif text-2xl">Message → proof → action</div>
                  <div className="mt-2 text-sm text-white/70">
                    Layout decisions are made to reduce cognitive load and increase intent.
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      { t: "Structure", d: "Sections that earn the scroll" },
                      { t: "Design", d: "Type, spacing, components" },
                      { t: "Build", d: "Fast, accessible implementation" },
                      { t: "Launch", d: "Analytics-ready handoff" },
                    ].map((x) => (
                      <div key={x.t} className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="font-mono text-xs text-white/70">{x.t}</div>
                        <div className="mt-2 text-xs text-white/65">{x.d}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section id="work" className="py-16 sm:py-20">
          <Container>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-serif text-3xl tracking-tight text-black/90">Selected work</h2>
                <p className="mt-2 max-w-2xl text-black/65">
                  More substance, fewer vibes: clear deliverables and measurable outcomes.
                </p>
              </div>
              <div className="font-mono text-xs text-black/50">(Sample case studies)</div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {caseStudies.map((c) => (
                <div key={c.title} className="rounded-3xl border border-black/10 bg-white/70 p-6 overflow-hidden">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-black/60">{c.meta}</div>
                      <div className="mt-3 font-serif text-xl text-black/90">{c.title}</div>
                    </div>
                    <div className="shrink-0 rounded-full border border-black/10 bg-white px-3 py-1 font-mono text-xs text-black/70">
                      {c.result}
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-black/65 break-words">{c.body}</div>
                  <ul className="mt-4 grid gap-2">
                    {c.bullets.map((b) => (
                      <li key={b} className="rounded-2xl border border-black/10 bg-white/60 p-3">
                        <div className="font-mono text-xs text-black/60">▸</div>
                        <div className="mt-1 text-sm text-black/80">{b}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section id="approach" className="py-16 sm:py-20">
          <Container>
            <h2 className="font-serif text-3xl tracking-tight text-black/90">Approach</h2>
            <p className="mt-2 max-w-2xl text-black/65">
              One interactive element. One strong narrative. No gimmicks.
            </p>

            <div className="mt-8 rounded-3xl border border-black/10 bg-white/70 p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="font-mono text-xs text-black/55">Focus</div>
                <div className="inline-flex rounded-full border border-black/10 bg-white p-1">
                  {(["studio", "product", "systems"] as const).map((k) => (
                    <button
                      key={k}
                      onClick={() => setTab(k)}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-semibold transition",
                        tab === k ? "bg-black text-white" : "text-black/70 hover:text-black"
                      )}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-7 grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="font-serif text-2xl text-black/90">{tabs[tab].title}</div>
                  <div className="mt-2 text-black/65">{tabs[tab].copy}</div>
                </div>
                <ul className="grid gap-3">
                  {tabs[tab].bullets.map((b) => (
                    <li key={b} className="rounded-2xl border border-black/10 bg-white/70 p-4">
                      <div className="font-mono text-xs text-black/60">▸</div>
                      <div className="mt-1 text-sm text-black/80">{b}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </section>

        <section id="contact" className="py-16 sm:py-20">
          <Container>
            <div className="rounded-3xl border border-black/10 bg-black p-8 text-white sm:p-10">
              <h2 className="font-serif text-3xl tracking-tight">Ready when you are.</h2>
              <p className="mt-2 max-w-2xl text-white/70">
                Email opens your mail client. Deck opens an embedded page you can replace with a real PDF later.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href="mailto:hello@stanleylabs.com?subject=Monochrome%20Studio%20Inquiry"
                  className="inline-flex items-center justify-center rounded-full bg-[#f59e0b] px-6 py-3 text-sm font-semibold text-black hover:bg-[#f59e0b]/90"
                >
                  Email us
                </a>
                <a
                  href="/deck.html"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  View deck
                </a>
              </div>
            </div>
          </Container>
        </section>

        <footer className="border-t border-black/10 py-10">
          <Container>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-black/70">
                <div className="font-serif text-black/90">Monochrome Studio</div>
                <div className="mt-1">Editorial landing sample.</div>
                <div className="mt-2 text-xs text-black/45">Stanley Labs</div>
              </div>
              <div className="font-mono text-xs text-black/50">© {new Date().getFullYear()}</div>
            </div>
          </Container>
        </footer>
      </main>
    </div>
  );
}
