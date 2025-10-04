import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Calendar, Award, Globe, Leaf, Search, ArrowUp, ArrowDown } from "lucide-react";

export type MilestoneTag = "Product" | "Sustainability" | "Award" | "Global";
export interface Milestone {
  id: string;
  year: number;
  date: string;
  title: string;
  body: string;
  tag: MilestoneTag;
  accent?: string;
  media?: { kind: "image" | "video"; src: string; alt?: string };
}

const MILESTONES: Milestone[] = [
  { id:"2008-foundation",year:2008,date:"2008-04-12",title:"Brand founded",body:"We opened our first studio with a bold mission: design everyday joy.",tag:"Global",accent:"from-emerald-400 to-lime-400",media:{kind:"image",src:"https://images.unsplash.com/photo-1529336953121-4a6b83f11fd4?q=80&w=1400&auto=format&fit=crop",alt:"First studio opening"}},
  { id:"2012-first-product",year:2012,date:"2012-09-05",title:"First hero product ships",body:"A small object with outsized impact. It set our design language.",tag:"Product",accent:"from-sky-400 to-cyan-400",media:{kind:"image",src:"https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1400&auto=format&fit=crop",alt:"Hero product on table"}},
  { id:"2016-global-expansion",year:2016,date:"2016-03-18",title:"10 new markets",body:"We grew our footprint across three continents while keeping supply local.",tag:"Global",accent:"from-fuchsia-400 to-pink-400",media:{kind:"video",src:"https://cdn.coverr.co/videos/coverr-city-sunrise-6313/1080p.mp4",alt:"Sunrise time-lapse over a city skyline"}},
  { id:"2018-award",year:2018,date:"2018-11-01",title:"Design award of the year",body:"Recognized by the industry for product and packaging innovation.",tag:"Award",accent:"from-amber-400 to-orange-400",media:{kind:"image",src:"https://images.unsplash.com/photo-1513530176992-0cf39c4cbed4?q=80&w=1400&auto=format&fit=crop",alt:"Award trophy with spotlight"}},
  { id:"2019-sustain",year:2019,date:"2019-06-07",title:"Zero-landfill pledge",body:"We committed to repurpose or recycle 100% of manufacturing byproducts by 2025.",tag:"Sustainability",accent:"from-green-400 to-emerald-500",media:{kind:"image",src:"https://images.unsplash.com/photo-1524593010061-9c58664ed63d?q=80&w=1400&auto=format&fit=crop",alt:"Forest canopy with sunlight"}},
  { id:"2021-community",year:2021,date:"2021-05-22",title:"Community initiative",body:"1% of revenue routed to local education and circular design grants.",tag:"Global",accent:"from-violet-400 to-indigo-400",media:{kind:"image",src:"https://images.unsplash.com/photo-1529078155058-5d716f45d604?q=80&w=1400&auto=format&fit=crop",alt:"Hands joining together"}},
  { id:"2022-rebrand",year:2022,date:"2022-09-14",title:"Brand refresh",body:"We introduced a cleaner wordmark and accessible color system.",tag:"Product",accent:"from-rose-400 to-red-400",media:{kind:"image",src:"https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1400&auto=format&fit=crop",alt:"New brand system on posters"}},
  { id:"2023-award",year:2023,date:"2023-12-02",title:"Sustainability leader",body:"Named a top-10 climate-forward brand in our category.",tag:"Award",accent:"from-yellow-300 to-lime-300",media:{kind:"image",src:"https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1400&auto=format&fit=crop",alt:"Laurel leaf pattern"}},
  { id:"2024-flagship",year:2024,date:"2024-04-09",title:"Flagship experience",body:"We launched an immersive flagship blending retail, repair, and reuse.",tag:"Product",accent:"from-blue-500 to-indigo-500",media:{kind:"image",src:"https://images.unsplash.com/photo-1532960401460-7488fd81d113?q=80&w=1400&auto=format&fit=crop",alt:"Flagship store interior"}},
  { id:"2025-net-zero",year:2025,date:"2025-06-01",title:"Net-zero operations",body:"Our owned operations reached net-zero emissions, verified by third parties.",tag:"Sustainability",accent:"from-emerald-500 to-teal-500",media:{kind:"image",src:"https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1400&auto=format&fit=crop",alt:"Wind turbines at sunset"}}
];

const TAG_META: Record<MilestoneTag, { icon: React.ReactNode; hue: string }> = {
  Product: { icon: <Calendar className="h-3.5 w-3.5" />, hue: "bg-sky-500" },
  Sustainability: { icon: <Leaf className="h-3.5 w-3.5" />, hue: "bg-emerald-500" },
  Award: { icon: <Award className="h-3.5 w-3.5" />, hue: "bg-amber-500" },
  Global: { icon: <Globe className="h-3.5 w-3.5" />, hue: "bg-fuchsia-500" }
};

const groupByYear = (items: Milestone[]) =>
  items.reduce<Record<number, Milestone[]>>((acc, m) => ((acc[m.year] ??= []).push(m), acc), {});

const normalize = (s: string) => s.toLowerCase().normalize("NFKD").replace(/\p{Diacritic}/gu, "");

// Media
function Media({ media }: { media?: Milestone["media"] }) {
  if (!media) return null;
  if (media.kind === "video") {
    return (
      <video
        className="h-56 w-full rounded-2xl object-cover md:h-64"
        src={media.src}
        autoPlay
        muted
        loop
        playsInline
        aria-label={media.alt || "Timeline video"}
      />
    );
  }
  return (
    <img
      src={media.src}
      alt={media.alt || "Timeline image"}
      className="h-56 w-full rounded-2xl object-cover md:h-64"
      loading="lazy"
      decoding="async"
    />
  );
}

// Active year observer
function useActiveYearObserver(ids: string[], onActive: (year: number) => void) {
  const observer = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    const opts: IntersectionObserverInit = { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 };
    const entries: Element[] = ids.map((id) => document.getElementById(id)).filter(Boolean) as Element[];
    observer.current?.disconnect();
    observer.current = new IntersectionObserver((records) => {
      const visible = records
        .filter((r) => r.isIntersecting)
        .sort((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? 1 : -1));
      const first = visible[0]?.target as HTMLElement | undefined;
      if (first) {
        const y = Number(first.getAttribute("data-year"));
        if (!Number.isNaN(y)) onActive(y);
      }
    }, opts);
    entries.forEach((el) => observer.current?.observe(el));
    return () => observer.current?.disconnect();
  }, [ids, onActive]);
}

// Year rail
function YearRail({ years, active, onJump }:{ years:number[]; active:number|null; onJump:(y:number)=>void }) {
  return (
    <div className="sticky top-28 hidden h-[calc(100vh-7rem)] select-none lg:block">
      <TooltipProvider>
        <div className="relative mx-auto flex h-full w-24 flex-col items-center justify-center">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-border to-transparent" />
          <ul className="z-10 flex flex-col gap-5">
            {years.map((y) => {
              const isActive = active === y;
              return (
                <li key={y} className="flex flex-col items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onJump(y)}
                        aria-label={`Jump to ${y}`}
                        className={
                          "group relative flex h-10 w-10 items-center justify-center rounded-full ring-0 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 " +
                          (isActive ? "scale-110" : "opacity-80 hover:scale-105")
                        }
                      >
                        <span
                          className={
                            "absolute inset-0 rounded-full bg-gradient-to-br p-px " +
                            (isActive ? "from-primary/80 to-primary/40" : "from-muted/40 to-muted/10")
                          }
                        />
                        <span className="relative inline-block h-2.5 w-2.5 rounded-full bg-primary shadow" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="px-2 py-1 text-xs">{y}</TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </div>
      </TooltipProvider>
    </div>
  );
}

// Card
function TimelineCard({ m, scrollYProgress }:{ m: Milestone; scrollYProgress:any }) {
  const prefersReduced = useReducedMotion();
  const y = useTransform(scrollYProgress, [0, 1], [0, prefersReduced ? 0 : -40]);
  const glow = `bg-gradient-to-r ${m.accent || "from-primary/30 to-primary/10"}`;

  return (
    <motion.article
      id={m.id}
      data-year={m.year}
      className="relative scroll-mt-28"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", stiffness: 60, damping: 14 }}
      aria-labelledby={`${m.id}-title`}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        <div className="relative md:col-span-2">
          <div className="absolute left-3 top-0 hidden h-full w-px bg-border md:block" />
          <div className="flex items-center gap-3 md:pl-6">
            <div className={`relative hidden h-3 w-3 rounded-full shadow md:block ${glow}`}></div>
            <div className="text-sm font-semibold text-gray-500">{m.year}</div>
          </div>
          <h3 id={`${m.id}-title`} className="mt-2 text-2xl font-semibold leading-tight">{m.title}</h3>
          <p className="mt-1 text-sm text-gray-500">{new Date(m.date).toLocaleDateString()}</p>
        </div>

        <motion.div style={{ y }}>
          <Card className="overflow-hidden border border-muted/60 shadow-sm transition-shadow hover:shadow-md">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="gap-1"><span className={`inline-flex h-2 w-2 rounded-full ${TAG_META[m.tag].hue}`} />{m.tag}</Badge>
                <span className="inline-flex h-5 items-center text-xs text-gray-500">{m.date}</span>
              </div>
              <CardTitle className="text-xl">{m.title}</CardTitle>
              <CardDescription className="text-base leading-relaxed text-black/80">
                {m.body}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <Media media={m.media} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.article>
  );
}

// Main
export default function BrandTimeline() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<"All"|MilestoneTag>("All");
  const [activeYear, setActiveYear] = useState<number|null>(null);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return MILESTONES
      .filter((m) => (tag === "All" ? true : m.tag === tag))
      .filter((m) =>
        !q ||
        normalize(m.title).includes(q) ||
        normalize(m.body).includes(q) ||
        String(m.year).includes(q) ||
        normalize(m.tag).includes(q)
      );
  }, [query, tag]);

  const grouped = useMemo(() => {
    const g = groupByYear(filtered);
    return Object.keys(g)
      .map(Number)
      .sort((a,b)=>b-a)
      .map((y)=>({ year:y, items: g[y].sort((a,b)=> (a.date > b.date ? 1 : -1)) }));
  }, [filtered]);

  const years = useMemo(() => Array.from(new Set(filtered.map(m=>m.year))).sort((a,b)=>b-a), [filtered]);
  const ids = useMemo(()=> filtered.map(m=>m.id), [filtered]);
  useActiveYearObserver(ids, setActiveYear);

  const jumpToYear = useCallback((y:number) => {
    const target = filtered.find(m=>m.year===y); if (!target) return;
    document.getElementById(target.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${target.id}`);
  }, [filtered]);

  const jumpToTop = useCallback(()=> window.scrollTo({ top:0, behavior:"smooth" }),[]);
  const jumpToLatest = useCallback(()=>{
    if (!filtered.length) return;
    const newest = [...filtered].sort((a,b)=> (a.date < b.date ? 1 : -1))[0];
    document.getElementById(newest.id)?.scrollIntoView({ behavior:"smooth", block:"start" });
    history.replaceState(null, "", `#${newest.id}`);
  },[filtered]);

  useEffect(()=> {
    const hash = window.location.hash.replace("#",""); if (!hash) return;
    document.getElementById(hash)?.scrollIntoView({ behavior:"smooth", block:"start" });
  },[]);

  return (
    <div className="relative">
      <motion.div style={{ scaleX: smooth }} className="fixed left-0 right-0 top-0 z-50 h-0.5 origin-left bg-gradient-to-r from-primary to-primary/40" aria-hidden />
      <section className="relative z-10 mx-auto max-w-6xl px-4 pt-20 md:px-6 md:pt-28">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-white shadow-md">
              <span className="text-lg font-bold">B</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Our Journey</h1>
              <p className="text-sm text-gray-500 md:text-base">Milestones from launch to today.</p>
            </div>
          </div>
          <div className="hidden gap-2 md:flex">
            <Button variant="outline" onClick={jumpToTop} className="gap-1.5"><ArrowUp className="h-4 w-4" />Top</Button>
            <Button onClick={jumpToLatest} className="gap-1.5"><ArrowDown className="h-4 w-4" />Latest</Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              placeholder="Search milestones, years, tags…"
              className="w-full rounded-2xl border bg-white px-9 py-3 text-sm outline-none ring-0 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              aria-label="Search timeline"
            />
          </div>
          <Tabs value={tag} onValueChange={(v)=>setTag(v as any)} className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-5 rounded-2xl md:w-auto md:grid-cols-5">
              {(["All","Product","Sustainability","Award","Global"] as const).map((t)=>(
                <TabsTrigger key={t} value={t} className="rounded-xl text-xs md:text-sm">{t}</TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={tag} className="sr-only" />
          </Tabs>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[6rem_1fr]">
          <YearRail years={years} active={activeYear} onJump={jumpToYear} />

          <div className="relative flex flex-col gap-12">
            <div className="pointer-events-none absolute left-4 top-0 hidden h-full w-px bg-gradient-to-b from-transparent via-border to-transparent lg:block" />

            {grouped.length === 0 && (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle>No results</CardTitle>
                  <CardDescription>Try adjusting your filters or search query.</CardDescription>
                </CardHeader>
              </Card>
            )}

            {grouped.map(({year, items})=>(
              <div key={year} className="space-y-8">
                <div className="sticky top-16 z-10 -mx-2 flex items-center gap-3 px-2 backdrop-blur md:top-20">
                  <div className="h-6 w-1 rounded bg-primary/70" />
                  <h2 className="text-lg font-semibold tracking-tight text-primary/90">{year}</h2>
                </div>
                <div className="space-y-12">
                  {items.map((m)=> <TimelineCard key={m.id} m={m} scrollYProgress={smooth} />)}
                </div>
              </div>
            ))}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-muted/30 p-4">
              <div>
                <p className="text-sm text-gray-500">Want to feature your own milestones?</p>
                <p className="text-sm">This component accepts your data and brand tokens.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={jumpToTop} className="gap-1.5"><ArrowUp className="h-4 w-4" />Top</Button>
                <Button onClick={jumpToLatest} className="gap-1.5"><ArrowDown className="h-4 w-4" />Latest</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media print {
          video { display: none !important; }
          .sticky { position: static !important; }
          .fixed { position: static !important; }
        }
      `}</style>
    </div>
  );
}
