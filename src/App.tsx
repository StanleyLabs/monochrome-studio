import { useState, useEffect, useRef } from "react";

/* ── helpers ── */
function cn(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ");
}

function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-6 sm:px-10", className)}>{children}</div>;
}

/* ── particle hero canvas ── */
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

    const count = 80;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * 1,
      y: Math.random() * 1,
      vx: (Math.random() - 0.5) * 0.0004,
      vy: (Math.random() - 0.5) * 0.0004,
      r: 1 + Math.random() * 2,
      opacity: 0.04 + Math.random() * 0.08,
    }));

    const connectionDist = 0.12;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${p.opacity})`;
        ctx.fill();
      }

      ctx.lineWidth = 0.5;
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < connectionDist) {
            const alpha = (1 - d / connectionDist) * 0.06;
            ctx.beginPath();
            ctx.moveTo(particles[i].x * w, particles[i].y * h);
            ctx.lineTo(particles[j].x * w, particles[j].y * h);
            ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.stroke();
          }
        }
      }

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
    title: "Black in Deep Red",
    artist: "Mark Rothko",
    year: "1957",
    medium: "Oil on canvas",
    image: "/images/Black_in_Deep_Red_1957.jpg",
    aspect: "aspect-[4/5]",
  },
  {
    title: "Painting",
    artist: "Franz Kline",
    year: "1952",
    medium: "Oil on canvas",
    image: "/images/Painting_Franz_Kilne_1952.jpg",
    aspect: "aspect-[4/5]",
  },
  {
    title: "Untitled",
    artist: "Robert Motherwell",
    year: "1943",
    medium: "Mixed media collage on paper",
    image: "/images/robert-motherwell-untitled-1943.jpg",
    aspect: "aspect-[3/4]",
  },
  {
    title: "Concetto Spaziale, Attese",
    artist: "Lucio Fontana",
    year: "1960",
    medium: "Water-based paint on canvas",
    image: "/images/Concetto_Spaziale_Attese_Lucio_Fontana_1960.jpg",
    aspect: "aspect-[3/4]",
  },
  {
    title: "Black Fire I",
    artist: "Barnett Newman",
    year: "1961",
    medium: "Oil on canvas",
    image: "/images/Black_Fire_I_Barnett_Newman_1961.jpg",
    aspect: "aspect-[2/3]",
  },
  {
    title: "Burnt Umber & Ultramarine",
    artist: "Yun Hyong-keun",
    year: "1986",
    medium: "Oil on linen",
    image: "/images/burnt-umber-ultramarine-by-yun-hyong-keun_1986.jpg",
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
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-black/35 mb-3">Inspiration</p>
                <h2 className="font-light text-3xl sm:text-4xl tracking-tight text-black/85">
                  Works that move us
                </h2>
              </div>
              <p className="hidden sm:block text-[11px] tracking-wide uppercase text-black/30">
                Artists we admire
              </p>
            </div>
            <p className="text-[13px] text-black/40 mb-12 max-w-2xl">
              These works are by the original artists credited below — not by Monochrome Studio.
              We showcase them here as the lineage and inspiration behind our practice.
            </p>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {works.map((w) => (
                <div key={w.title} className="art-card group cursor-pointer">
                  <div className={cn("overflow-hidden rounded-sm bg-neutral-200", w.aspect)}>
                    <img
                      src={w.image}
                      alt={`${w.title} by ${w.artist}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-normal text-black/80 group-hover:text-black transition-colors italic">
                      {w.title}
                    </h3>
                    <p className="text-[13px] text-black/60 mt-1 font-medium">{w.artist}</p>
                    <p className="text-[11px] text-black/35 mt-0.5">
                      {w.medium}, {w.year}
                    </p>
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
