import { useState, useEffect, useRef } from "react";

/* ── helpers ── */
function cn(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ");
}

function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-6 sm:px-10", className)}>{children}</div>;
}

/* ── animated paintbrush hero canvas ── */
function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    // brush state
    let bx = 0;
    let by = 0;
    let angle = Math.random() * Math.PI * 2;
    let speed = 1.8;
    let turnNoise = Math.random() * 1000;

    // stroke history — persistent marks
    const strokes: Array<{ x: number; y: number; size: number; opacity: number; angle: number }> = [];
    const maxStrokes = 2500;

    // splatter particles
    const splatters: Array<{
      x: number; y: number; size: number; opacity: number; life: number; maxLife: number;
    }> = [];

    // brush tip shape — paint a bristle-like stamp
    const paintBrush = (x: number, y: number, size: number, opacity: number, ang: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.globalAlpha = opacity;

      // main bristle body
      const bristles = 5 + Math.floor(size / 4);
      for (let i = 0; i < bristles; i++) {
        const offset = (i - bristles / 2) * (size / bristles) * 0.9;
        const bristleLen = size * (0.6 + Math.random() * 0.5);
        const bristleW = Math.max(0.5, size / bristles * 0.7);
        ctx.beginPath();
        ctx.ellipse(offset, 0, bristleW, bristleLen * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(30, 28, 25, ${0.3 + Math.random() * 0.4})`;
        ctx.fill();
      }

      ctx.restore();
    };

    // simple 2D noise-ish function
    const noise = (v: number) => {
      const s = Math.sin(v * 127.1 + 311.7) * 43758.5453;
      return s - Math.floor(s);
    };

    const smoothNoise = (v: number) => {
      const i = Math.floor(v);
      const f = v - i;
      const t = f * f * (3 - 2 * f);
      return noise(i) * (1 - t) + noise(i + 1) * t;
    };

    // init brush position
    const initBrush = () => {
      bx = w * 0.5;
      by = h * 0.5;
    };

    initBrush();

    let t = 0;
    let phaseTimer = 0;
    let currentStrokeSize = 6 + Math.random() * 10;
    let lifting = false;

    const draw = () => {
      t += 1;
      turnNoise += 0.012;

      // slowly fade the whole canvas to let old marks age
      // we redraw everything from strokes array instead
      ctx.clearRect(0, 0, w, h);

      // steer brush with flowing curves
      const n1 = smoothNoise(turnNoise) - 0.5;
      const n2 = smoothNoise(turnNoise * 1.7 + 50) - 0.5;
      angle += n1 * 0.12 + n2 * 0.06;

      // slight pull toward center to keep brush in frame
      const cx = w * 0.5;
      const cy = h * 0.5;
      const dx = cx - bx;
      const dy = cy - by;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.min(w, h) * 0.42;
      if (dist > maxDist * 0.5) {
        const pull = ((dist - maxDist * 0.5) / maxDist) * 0.03;
        angle += Math.atan2(dy, dx) * pull - angle * pull * 0.3;
      }

      // vary speed
      speed = 1.5 + smoothNoise(turnNoise * 0.8 + 100) * 2;

      bx += Math.cos(angle) * speed;
      by += Math.sin(angle) * speed;

      // stroke phases — paint, then lift, then paint again
      phaseTimer++;
      if (!lifting && phaseTimer > 80 + Math.random() * 200) {
        lifting = true;
        phaseTimer = 0;
      } else if (lifting && phaseTimer > 15 + Math.random() * 40) {
        lifting = false;
        phaseTimer = 0;
        currentStrokeSize = 4 + Math.random() * 12;
      }

      // add stroke marks when painting
      if (!lifting) {
        const size = currentStrokeSize * (0.7 + smoothNoise(t * 0.05) * 0.6);
        const opacity = 0.08 + smoothNoise(t * 0.03 + 200) * 0.12;
        strokes.push({ x: bx, y: by, size, opacity, angle });

        // occasional splatter
        if (Math.random() < 0.03) {
          const count = 1 + Math.floor(Math.random() * 3);
          for (let i = 0; i < count; i++) {
            const sAngle = angle + (Math.random() - 0.5) * 2;
            const sDist = 5 + Math.random() * 20;
            splatters.push({
              x: bx + Math.cos(sAngle) * sDist,
              y: by + Math.sin(sAngle) * sDist,
              size: 1 + Math.random() * 3,
              opacity: 0.1 + Math.random() * 0.15,
              life: 0,
              maxLife: 300 + Math.random() * 200,
            });
          }
        }

        if (strokes.length > maxStrokes) {
          strokes.splice(0, strokes.length - maxStrokes);
        }
      }

      // render all strokes
      for (const s of strokes) {
        paintBrush(s.x, s.y, s.size, s.opacity, s.angle);
      }

      // render splatters
      for (let i = splatters.length - 1; i >= 0; i--) {
        const sp = splatters[i];
        sp.life++;
        const fade = 1 - sp.life / sp.maxLife;
        if (fade <= 0) {
          splatters.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(30, 28, 25, ${sp.opacity * fade})`;
        ctx.fill();
      }

      // draw the brush itself (the "handle")
      if (!lifting) {
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(angle - Math.PI * 0.5);

        // handle
        ctx.beginPath();
        ctx.roundRect(-2.5, -35, 5, 30, 2);
        ctx.fillStyle = "rgba(80, 65, 50, 0.5)";
        ctx.fill();

        // ferrule
        ctx.beginPath();
        ctx.roundRect(-3.5, -8, 7, 8, 1);
        ctx.fillStyle = "rgba(160, 155, 145, 0.45)";
        ctx.fill();

        // bristle tip
        ctx.beginPath();
        ctx.ellipse(0, 4, currentStrokeSize * 0.4, 6, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(30, 28, 25, 0.35)";
        ctx.fill();

        ctx.restore();
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
              <div className="hidden sm:block aspect-square overflow-hidden">
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
