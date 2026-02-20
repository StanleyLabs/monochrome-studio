import { useState, useEffect, useRef } from "react";

/* ── helpers ── */
function cn(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ");
}

function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-6 sm:px-10", className)}>{children}</div>;
}

/* ── generative hero canvas ── */
function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // A set of slowly drifting ink-like forms
    const forms = Array.from({ length: 7 }, () => ({
      x: 0.2 + Math.random() * 0.6,
      y: 0.15 + Math.random() * 0.7,
      r: 30 + Math.random() * 60,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.4,
      drift: 0.15 + Math.random() * 0.25,
      opacity: 0.04 + Math.random() * 0.06,
      sides: 3 + Math.floor(Math.random() * 4),
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
    }));

    // Thin lines that slowly draw across
    const lines = Array.from({ length: 4 }, () => ({
      y: 0.2 + Math.random() * 0.6,
      speed: 0.08 + Math.random() * 0.12,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.06 + Math.random() * 0.06,
      wave: 15 + Math.random() * 25,
    }));

    const draw = () => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);

      t += 0.008;

      // draw organic forms
      for (const f of forms) {
        const cx = w * f.x + Math.sin(t * f.speed + f.phase) * w * f.drift;
        const cy = h * f.y + Math.cos(t * f.speed * 0.7 + f.phase) * h * f.drift * 0.5;
        const rot = f.rotation + t * f.rotSpeed;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.beginPath();

        const points = f.sides;
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const wobble = 1 + Math.sin(t * 1.5 + angle * 2 + f.phase) * 0.3;
          const px = Math.cos(angle) * f.r * wobble;
          const py = Math.sin(angle) * f.r * wobble;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        ctx.closePath();
        ctx.fillStyle = `rgba(0, 0, 0, ${f.opacity})`;
        ctx.fill();
        ctx.restore();
      }

      // draw drifting lines
      for (const l of lines) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 0, 0, ${l.opacity})`;
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= w; x += 3) {
          const y =
            h * l.y +
            Math.sin(x * 0.008 + t * l.speed + l.phase) * l.wave +
            Math.sin(x * 0.003 + t * 0.3) * l.wave * 0.5;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // small scattered dots that fade in and out
      for (let i = 0; i < 12; i++) {
        const dx = w * (0.1 + ((i * 0.618033988) % 1) * 0.8);
        const dy = h * (0.1 + (((i * 7 + 3) * 0.618033988) % 1) * 0.8);
        const dotOp = (Math.sin(t * 0.5 + i * 2.3) + 1) * 0.03;
        ctx.beginPath();
        ctx.arc(dx + Math.sin(t * 0.4 + i) * 8, dy + Math.cos(t * 0.3 + i) * 8, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${dotOp})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

/* ── data ── */
const works = [
  {
    title: "Silence Between",
    medium: "Oil on linen",
    year: "2026",
    dimensions: '48 × 36"',
    color: "bg-stone-300",
    aspect: "aspect-[3/4]",
  },
  {
    title: "Weight of Light",
    medium: "Charcoal & graphite",
    year: "2025",
    dimensions: '60 × 40"',
    color: "bg-zinc-200",
    aspect: "aspect-[2/3]",
  },
  {
    title: "Territory",
    medium: "Mixed media on panel",
    year: "2026",
    dimensions: '36 × 36"',
    color: "bg-neutral-300",
    aspect: "aspect-square",
  },
  {
    title: "After the Flood",
    medium: "Ink wash on paper",
    year: "2025",
    dimensions: '24 × 18"',
    color: "bg-stone-200",
    aspect: "aspect-[3/4]",
  },
  {
    title: "Object Lesson",
    medium: "Bronze & found steel",
    year: "2026",
    dimensions: '18 × 12 × 8"',
    color: "bg-zinc-300",
    aspect: "aspect-[4/5]",
  },
  {
    title: "Fugue State",
    medium: "Acrylic & gesso",
    year: "2024",
    dimensions: '72 × 48"',
    color: "bg-neutral-200",
    aspect: "aspect-[3/4]",
  },
];

const exhibitions = [
  { title: "Quiet Loud", venue: "Pace Gallery, New York", date: "Mar — May 2026" },
  { title: "Material Evidence", venue: "White Cube, London", date: "Jan — Feb 2026" },
  { title: "New Cartographies", venue: "MOCA, Los Angeles", date: "Sep — Dec 2025" },
  { title: "Paper Weight", venue: "Kunsthalle, Berlin", date: "Jun — Aug 2025" },
];

/* ── component ── */
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh">
      {/* ── nav ── */}
      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#f5f2ed]/80 backdrop-blur-md">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <a href="#" className="font-light tracking-[0.25em] text-sm uppercase text-black/80">
              Monochrome
            </a>

            <nav className="hidden items-center gap-10 sm:flex">
              {["Work", "Exhibitions", "About", "Contact"].map((l) => (
                <a
                  key={l}
                  href={`#${l.toLowerCase()}`}
                  className="underline-sweep text-[13px] tracking-wide text-black/55 hover:text-black/90 uppercase"
                >
                  {l}
                </a>
              ))}
            </nav>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden text-[13px] tracking-wide uppercase text-black/55"
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </Container>

        {menuOpen && (
          <div className="sm:hidden border-t border-black/[0.06] bg-[#f5f2ed] px-6 py-6 space-y-5">
            {["Work", "Exhibitions", "About", "Contact"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className="block text-sm tracking-wide uppercase text-black/70"
              >
                {l}
              </a>
            ))}
          </div>
        )}
      </header>

      <main>
        {/* ── hero ── */}
        <section className="relative overflow-hidden">
          <div className="grain absolute inset-0" />
          <Container className="relative">
            <div className="py-24 sm:py-36 grid sm:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="font-light text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] tracking-tight text-black/90">
                  Art lives in the
                  <br />
                  space between.
                </h1>
                <p className="mt-6 max-w-lg text-base leading-relaxed text-black/50">
                  Monochrome Studio is an art practice rooted in material honesty and formal restraint.
                  We make work that asks you to slow down.
                </p>
                <div className="mt-10 flex items-center gap-8">
                  <a
                    href="#work"
                    className="text-[13px] tracking-wide uppercase border-b border-black/30 pb-1 text-black/70 hover:text-black hover:border-black transition-colors"
                  >
                    View work
                  </a>
                  <a
                    href="#contact"
                    className="text-[13px] tracking-wide uppercase text-black/40 hover:text-black/70 transition-colors"
                  >
                    Get in touch
                  </a>
                </div>
              </div>

              {/* generative art canvas */}
              <div className="hidden sm:block aspect-square rounded-sm overflow-hidden bg-[#f0ece6]">
                <HeroCanvas />
              </div>
            </div>
          </Container>
        </section>

        {/* ── divider ── */}
        <div className="mx-6 sm:mx-10 border-t border-black/[0.06]" />

        {/* ── work grid ── */}
        <section id="work" className="py-20 sm:py-28">
          <Container>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-black/35 mb-3">Selected Works</p>
                <h2 className="font-light text-3xl sm:text-4xl tracking-tight text-black/85">Recent work</h2>
              </div>
              <p className="hidden sm:block text-[11px] tracking-wide uppercase text-black/30">2024 — 2026</p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {works.map((w) => (
                <div key={w.title} className="art-card group cursor-pointer">
                  <div className={cn("overflow-hidden rounded-sm", w.aspect, w.color)}>
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[11px] tracking-[0.15em] uppercase text-black/20 select-none">
                        {w.medium}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-normal text-black/80 group-hover:text-black transition-colors">
                        {w.title}
                      </h3>
                      <p className="text-[12px] text-black/40 mt-0.5">{w.medium}</p>
                    </div>
                    <p className="text-[11px] text-black/30 shrink-0 mt-0.5">{w.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ── exhibitions ── */}
        <section id="exhibitions" className="py-20 sm:py-28 bg-[#eae7e1]">
          <Container>
            <p className="text-[11px] tracking-[0.2em] uppercase text-black/35 mb-3">Exhibitions</p>
            <h2 className="font-light text-3xl sm:text-4xl tracking-tight text-black/85 mb-12">
              Where we've shown
            </h2>

            <div className="space-y-0 border-t border-black/[0.08]">
              {exhibitions.map((e) => (
                <div
                  key={e.title}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-black/[0.08] hover:pl-2 transition-all"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-light text-black/80 group-hover:text-black transition-colors">
                      {e.title}
                    </h3>
                    <p className="text-[13px] text-black/40 mt-1">{e.venue}</p>
                  </div>
                  <p className="text-[12px] tracking-wide uppercase text-black/30 mt-2 sm:mt-0">{e.date}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ── about ── */}
        <section id="about" className="py-20 sm:py-28">
          <Container>
            <div className="grid gap-12 sm:grid-cols-2 items-start">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-black/35 mb-3">About</p>
                <h2 className="font-light text-3xl sm:text-4xl tracking-tight text-black/85">
                  Restraint as expression
                </h2>
              </div>
              <div className="space-y-5 text-[15px] leading-relaxed text-black/55">
                <p>
                  Monochrome Studio was founded in 2019 with a simple conviction: the most powerful work
                  emerges from limitation. We strip away the unnecessary — color becomes tone, gesture
                  becomes structure, surface becomes meaning.
                </p>
                <p>
                  Working primarily in oil, charcoal, ink, and bronze, we explore the tension between
                  presence and absence. Our practice draws from minimalism, post-war abstraction, and the
                  quieter traditions of East Asian painting.
                </p>
                <p>
                  Every piece begins with material — its weight, its resistance, its willingness to hold
                  a mark. We don't impose. We listen.
                </p>
              </div>
            </div>

            <div className="mt-20 grid gap-px bg-black/[0.06] sm:grid-cols-3 rounded-sm overflow-hidden">
              {[
                {
                  title: "Material first",
                  body: "We begin with the physical. The grain of linen, the density of charcoal, the cold of bronze. Process follows material.",
                },
                {
                  title: "Formal clarity",
                  body: "Composition is editing. We pursue the irreducible — the fewest elements that still hold meaning.",
                },
                {
                  title: "Patience",
                  body: "Good work takes time. We don't rush to finish; we stay until the piece is honest.",
                },
              ].map((v) => (
                <div key={v.title} className="bg-[#f5f2ed] p-8">
                  <h3 className="text-sm font-medium text-black/70">{v.title}</h3>
                  <p className="mt-3 text-[13px] leading-relaxed text-black/45">{v.body}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ── contact ── */}
        <section id="contact" className="py-20 sm:py-28 bg-[#1a1a1a] text-white">
          <Container>
            <div className="max-w-2xl">
              <p className="text-[11px] tracking-[0.2em] uppercase text-white/30 mb-3">Contact</p>
              <h2 className="font-light text-3xl sm:text-4xl tracking-tight text-white/90">
                Let's talk about work.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-white/40">
                For commissions, exhibitions, studio visits, or press inquiries.
              </p>

              <div className="mt-10 space-y-4">
                <a
                  href="mailto:studio@monochrome.art"
                  className="block text-lg font-light text-white/70 hover:text-white transition-colors"
                >
                  studio@monochrome.art
                </a>
                <p className="text-[13px] text-white/30">Nashville, Tennessee</p>
              </div>

              <div className="mt-12 flex gap-8">
                {["Instagram", "Are.na"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="text-[12px] tracking-wide uppercase text-white/25 hover:text-white/60 transition-colors"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </Container>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] bg-[#1a1a1a] py-8">
        <Container>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-[11px] tracking-[0.15em] uppercase text-white/20">
              Monochrome Studio
            </p>
            <p className="text-[11px] text-white/15">© {new Date().getFullYear()}</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
