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

    // offscreen canvas for persistent marks
    const marks = document.createElement("canvas");
    const mctx = marks.getContext("2d")!;

    let animId: number;
    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;

      // save existing marks
      const snapshot = marks.width > 0 ? mctx.getImageData(0, 0, marks.width, marks.height) : null;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      marks.width = w * dpr;
      marks.height = h * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // restore marks after resize
      if (snapshot) {
        mctx.putImageData(snapshot, 0, 0);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    // noise helpers
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

    // brush state
    let bx = w * 0.6;
    let by = h * 0.4;
    let angle = Math.random() * Math.PI * 2;
    let targetAngle = angle;
    let turnNoise = Math.random() * 1000;
    let pressure = 0.7;
    let targetPressure = 0.7;
    let tilt = 0;

    let phaseTimer = 0;
    let currentStrokeSize = 8 + Math.random() * 10;
    let lifting = false;
    let liftX = bx;
    let liftY = by;
    let t = 0;

    // paint a bristle mark onto the offscreen canvas
    const stampBristle = (x: number, y: number, size: number, opacity: number, ang: number, press: number) => {
      mctx.save();
      mctx.translate(x, y);
      mctx.rotate(ang);
      mctx.globalAlpha = opacity * press;

      const spread = size * press;
      const bristles = 6 + Math.floor(size / 3);

      for (let i = 0; i < bristles; i++) {
        const off = (i - bristles / 2) * (spread / bristles) * 1.1;
        const bLen = size * (0.4 + Math.random() * 0.4) * press;
        const bW = Math.max(0.4, spread / bristles * 0.6);
        mctx.beginPath();
        mctx.ellipse(off, 0, bW, bLen * 0.5, 0, 0, Math.PI * 2);
        mctx.fillStyle = `rgba(30, 28, 25, ${0.25 + Math.random() * 0.35})`;
        mctx.fill();
      }

      mctx.restore();
    };

    const draw = () => {
      t += 1;
      turnNoise += 0.008;

      // clear display canvas, then composite marks + live brush
      ctx.clearRect(0, 0, w, h);

      // ── steer brush ──
      // layered noise for organic curves
      const n1 = smoothNoise(turnNoise) - 0.5;
      const n2 = smoothNoise(turnNoise * 1.3 + 50) - 0.5;
      const n3 = smoothNoise(turnNoise * 0.4 + 200) - 0.5;
      targetAngle += n1 * 0.08 + n2 * 0.05 + n3 * 0.03;

      // smooth angle interpolation for fluid motion
      let angleDiff = targetAngle - angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      angle += angleDiff * 0.12;

      // gentle pull toward center region (wide bounds since it's full-width)
      const cx = w * 0.55;
      const cy = h * 0.5;
      const dx = cx - bx;
      const dy = cy - by;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.max(w, h) * 0.4;
      if (dist > maxDist * 0.3) {
        const pull = ((dist - maxDist * 0.3) / maxDist) * 0.02;
        const toCenter = Math.atan2(dy, dx);
        targetAngle += (toCenter - targetAngle) * pull;
      }

      // keep in bounds with soft wrapping
      const margin = 30;
      if (bx < margin) targetAngle = Math.abs(targetAngle) < Math.PI / 2 ? targetAngle : 0;
      if (bx > w - margin) targetAngle = Math.abs(targetAngle) > Math.PI / 2 ? targetAngle : Math.PI;
      if (by < margin) targetAngle = targetAngle > 0 ? targetAngle : Math.PI * 0.5;
      if (by > h - margin) targetAngle = targetAngle < 0 ? targetAngle : -Math.PI * 0.5;

      // variable speed — slow down on curves, speed up on straights
      const curvature = Math.abs(angleDiff);
      const speed = (2.0 + smoothNoise(turnNoise * 0.6 + 100) * 2.5) * (1 - curvature * 0.3);

      bx += Math.cos(angle) * speed;
      by += Math.sin(angle) * speed;

      // tilt wobble
      tilt = Math.sin(t * 0.04) * 0.15 + Math.sin(t * 0.11) * 0.08;

      // smooth pressure changes
      targetPressure = 0.5 + smoothNoise(turnNoise * 0.5 + 300) * 0.5;
      pressure += (targetPressure - pressure) * 0.05;

      // ── stroke phases ──
      phaseTimer++;
      if (!lifting && phaseTimer > 120 + Math.random() * 250) {
        lifting = true;
        liftX = bx;
        liftY = by;
        phaseTimer = 0;
      } else if (lifting && phaseTimer > 25 + Math.random() * 50) {
        lifting = false;
        phaseTimer = 0;
        currentStrokeSize = 5 + Math.random() * 14;
      }

      // ── stamp marks onto offscreen canvas ──
      if (!lifting) {
        const size = currentStrokeSize * (0.6 + smoothNoise(t * 0.04) * 0.5);
        const opacity = 0.06 + smoothNoise(t * 0.025 + 200) * 0.1;
        stampBristle(bx, by, size, opacity, angle + tilt, pressure);

        // splatters
        if (Math.random() < 0.025) {
          const count = 1 + Math.floor(Math.random() * 4);
          for (let i = 0; i < count; i++) {
            const sAngle = angle + (Math.random() - 0.5) * 2.5;
            const sDist = 8 + Math.random() * 30;
            const sx = bx + Math.cos(sAngle) * sDist;
            const sy = by + Math.sin(sAngle) * sDist;
            const sSize = 0.8 + Math.random() * 2.5;
            mctx.beginPath();
            mctx.arc(sx, sy, sSize, 0, Math.PI * 2);
            mctx.fillStyle = `rgba(30, 28, 25, ${0.08 + Math.random() * 0.12})`;
            mctx.fill();
          }
        }
      }

      // ── composite marks onto display ──
      ctx.drawImage(marks, 0, 0, w * dpr, h * dpr, 0, 0, w, h);

      // ── draw the brush ──
      const brushX = lifting ? liftX + (bx - liftX) * 0.3 : bx;
      const brushY = lifting ? liftY + (by - liftY) * 0.3 - 15 * Math.sin(phaseTimer * 0.08) : by;
      const brushAngle = angle + tilt - Math.PI * 0.5;
      const brushLift = lifting ? 0.3 : 0.7;

      ctx.save();
      ctx.globalAlpha = brushLift;
      ctx.translate(brushX, brushY);
      ctx.rotate(brushAngle);

      // shadow when close to surface
      if (!lifting) {
        ctx.beginPath();
        ctx.ellipse(2, 8, currentStrokeSize * 0.35 * pressure, 3, 0.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.06)";
        ctx.fill();
      }

      // handle — wooden brush handle
      const wobble = Math.sin(t * 0.06) * 1.5;
      ctx.beginPath();
      ctx.roundRect(-3 + wobble * 0.3, -50, 6, 38, 2.5);
      ctx.fillStyle = "rgba(120, 90, 60, 0.55)";
      ctx.fill();
      // handle highlight
      ctx.beginPath();
      ctx.roundRect(-1 + wobble * 0.3, -48, 2, 34, 1);
      ctx.fillStyle = "rgba(180, 150, 110, 0.2)";
      ctx.fill();

      // ferrule — metal band
      ctx.beginPath();
      ctx.roundRect(-4.5 + wobble * 0.2, -14, 9, 12, 1.5);
      ctx.fillStyle = "rgba(170, 165, 155, 0.5)";
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(-3.5 + wobble * 0.2, -13, 7, 10, 1);
      ctx.fillStyle = "rgba(190, 185, 175, 0.25)";
      ctx.fill();

      // bristle tip — varies with pressure
      const tipSpread = currentStrokeSize * 0.4 * (0.7 + pressure * 0.5);
      const tipLen = 8 + pressure * 4;
      ctx.beginPath();
      ctx.ellipse(wobble * 0.15, tipLen * 0.3, tipSpread, tipLen * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(30, 28, 25, ${0.25 + pressure * 0.15})`;
      ctx.fill();

      // individual bristle lines
      const bristleCount = 4;
      for (let i = 0; i < bristleCount; i++) {
        const bOff = (i - bristleCount / 2) * (tipSpread * 0.5);
        ctx.beginPath();
        ctx.moveTo(bOff + wobble * 0.1, -2);
        ctx.lineTo(bOff * (1 + pressure * 0.3) + wobble * 0.1, tipLen * 0.7);
        ctx.strokeStyle = `rgba(30, 28, 25, ${0.15 + Math.random() * 0.1})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      ctx.restore();

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
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
        <section className="relative overflow-hidden min-h-[70vh] sm:min-h-[80vh] flex items-center">
          <div className="grain absolute inset-0" />
          <HeroCanvas />
          <Container className="relative z-10">
            <div className="py-24 sm:py-36 max-w-xl">
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
