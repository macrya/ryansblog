import type { Poem, CuriosityEssay, ComputerArticle, DiaryPost, BlogComment } from '../types';

export const WALLPAPER_SNIPPETS = `
"Pain and suffering are always inevitable for a large intelligence and a deep heart. The really great men must, I think, have great sadness on earth." — Fyodor Dostoevsky (Crime and Punishment)
"Find what you love and let it kill you. Let it drain you of your all. Let it cling onto your back and weigh you down into nothingness." — Charles Bukowski
"To love someone means to see them as God intended them." — Fyodor Dostoevsky
"There is a loneliness in this world so great that you can see it in the slow movement of the hands of a clock." — Charles Bukowski
"It takes something more than intelligence to act intelligently." — Fyodor Dostoevsky
"Some people never go crazy. What truly horrible lives they must lead." — Charles Bukowski
"Above all, don't lie to yourself. The man who lies to himself and listens to his own lie comes to a point that he cannot distinguish the truth within him." — Fyodor Dostoevsky (The Brothers Karamazov)
"We are here to unlearn the teachings of the church, state, and our educational system. We are here to drink beer. We are here to kill war." — Charles Bukowski
"The darker the night, the brighter the stars, the deeper the grief, the closer is God!" — Fyodor Dostoevsky
"My dear, find what you love and let it kill you." — Charles Bukowski
"Much unhappiness has come into the world because of bewilderment and things left unsaid." — Fyodor Dostoevsky
"Poetry is what happens when nothing else can." — Charles Bukowski
"I used to think that the brain was the most wonderful organ in my body. Then I realized who was telling me this." — Fyodor Dostoevsky
"Can you understand why a man would kill himself for love? Yes, but only if he were an idiot." — Fyodor Dostoevsky
"The soul is healed by being with children." — Fyodor Dostoevsky
"There are days when it seems the sky itself is holding its breath." — Charles Bukowski
`;

export const INITIAL_POEMS: Poem[] = [
  {
    id: 'poem-1',
    title: 'The Geometry of Longing',
    subtitle: 'On Cartesian planes and irrevocable departures',
    date: 'Autumn, 2025',
    theme: 'Love',
    dedication: 'For the one who departed before the dawn mist cleared',
    quoteExcerpt: 'Two parallel vectors that grazed a singularity, only to diverge forever.',
    stanzas: [
      [
        'We met where Euclidean rules surrender to grief,',
        'at the junction of salt and iron railway ties.',
        'You held a cup of black coffee like an anchor,',
        'refusing the tide of what we could not speak.',
      ],
      [
        'I measured the distance between your knuckles',
        'and the mahogany edge of the counter.',
        'Three centimeters of quiet air;',
        'an entire hemisphere of uncrossable terrain.',
      ],
      [
        'Now every city street repeats your posture—',
        'a coat pulled tight against the northern wind,',
        'a silhouette dissolving into rain,',
        'leaving only the phantom hum of an unsaid sentence.',
      ],
    ],
  },
  {
    id: 'poem-2',
    title: 'St. Petersburg at 3 A.M.',
    subtitle: 'Homage to Dostoevsky’s fevered canal bridges',
    date: 'Winter, 2025',
    theme: 'Existentialism',
    dedication: 'To the sleepless intellects wandering along the Fontanka',
    quoteExcerpt: 'The mind is an echo chamber when the conscience refuses sleep.',
    stanzas: [
      [
        'The ice groans under the stone arches of the bridge,',
        'a sound like tearing silk or an old man’s breath.',
        'I have walked seventeen thousand steps tonight,',
        'counting cobblestones as if they were absolution.',
      ],
      [
        'A single lamp flickers yellow in a fourth-floor garret.',
        'Someone up there is arguing with an idea,',
        'wrestling with whether God permitted the ax,',
        'or if the fever is simply what happens when youth curdles.',
      ],
      [
        'I lean over the frozen balustrade.',
        'The dark water sleeps beneath the crust,',
        'patient as eternity,',
        'indifferent to our manufactured sins.',
      ],
    ],
  },
  {
    id: 'poem-3',
    title: 'Entropy & The Blue Flame',
    subtitle: 'Thermodynamics of an aging room',
    date: 'Summer, 2026',
    theme: 'Transience',
    quoteExcerpt: 'Heat flows spontaneously from warm hearts to cold rooms.',
    stanzas: [
      [
        'The gas burner hisses its low blue crown in the kitchen.',
        'Outside, the boulevard exhales the day’s exhaust.',
        'Bukowski wrote on a battered Royal typewriter',
        'while cheap wine stained the edges of his solitude.',
      ],
      [
        'I write on illuminated glass that does not rust,',
        'yet the identical hunger claws behind my ribs:',
        'to catch one true syllable before the midnight bell,',
        'before the dust resumes its lawful claim on everything we built.',
      ],
      [
        'Give me no monuments, no gilded spine.',
        'Just one reader on a delayed suburban train',
        'who stops, looks out into the gathering dusk,',
        'and whispers: yes, I felt that wound too.',
      ],
    ],
  },
];

export const INITIAL_CURIOSITIES: CuriosityEssay[] = [
  {
    id: 'f1-ground-effects',
    title: 'Ground Effect & Venturi Tunnels: The Fluid Physics of Modern Formula 1',
    category: 'F1 Aerodynamics',
    readTime: '8 min read',
    year: '1977 — 2026',
    summary:
      'How Colin Chapman’s Lotus 78 weaponized Bernoulli’s principle to suck cars to the asphalt, and why the 2022 technical regulations resurrected underfloor ground effects to cure aerodynamic wake.',
    content: [
      'In 1977, Colin Chapman and aerodynamicist Peter Wright looked underneath the Lotus 78 chassis and asked an heretical question: Why must downforce be bought exclusively with drag-inducing wings towering in the free airstream, when the earth itself can be turned into an aerodynamic partner?',
      'By shaping the sidepod underfloors into inverted venturi convergent-divergent nozzles and sealing the edges with sliding Lexan skirts that brushed the track surface, Team Lotus created a localized low-pressure plenum beneath the cockpit. As air was forced through the narrow throat between chassis and tarmac, its velocity surged (v1 -> v2), causing static pressure to collapse proportionally to (p + 1/2 * rho * v^2 = constant). The car was effectively glued to the asphalt by the atmosphere itself.',
      'The sheer grip was intoxicating. Cornering loads jumped from 2G to over 4G. Drivers experienced neck strain so severe their heads had to be strapped to cockpit braces. Yet the flaw was fatal: if the car struck a curb and broke the underfloor seal, atmospheric air rushed into the low-pressure pocket, downforce disappeared in a millisecond, and the car became a ballistic missile.',
      'Fast-forward to the 2022 FIA technical overhaul. Modern F1 banned complex over-body bargeboards and vortices that produced ‘dirty air’ in favor of twin sculpted underfloor 3D Venturi tunnels. The result was a dramatic restoration of close racing, tempered by the acoustic violence of "porpoising"—an aerodynamic harmonic resonance where floor-stall and ride-height rebound oscillated at 5 to 7 Hz.',
    ],
    keyDiagramNotes: [
      {
        term: 'Venturi Throat Area (A1 vs A2)',
        definition: 'Continuity equation: Mass flow m = rho * A * v is conserved. As cross-sectional area constricts by 60%, flow velocity spikes, generating localized depression.',
      },
      {
        term: 'Dynamic Ride-Height Stall',
        definition: 'At speeds exceeding 315 km/h, aero load compresses suspension until floor clearance approaches 10mm, inducing boundary layer separation and sudden loss of suction.',
      },
      {
        term: 'Floor Edge Vortex Sheets',
        definition: 'Modern longitudinal floor edge fences create sacrificial helical vortices that replace physical skirts, barricading external turbulent tire squish.',
      },
    ],
    specSheet: [
      { label: 'Downforce Percentage from Floor', value: '~60% of total package' },
      { label: 'Peak Aerodynamic Load at 300 km/h', value: 'Over 2,200 kg' },
      { label: 'Theoretical Inverted Driving Speed', value: '160 km/h (100 mph)' },
    ],
  },
  {
    id: '90s-japanese-combustion',
    title: 'The Golden Decade of 90s Japanese Combustion: RB26, 2JZ & B16 VTEC',
    category: '90s Combustion',
    readTime: '11 min read',
    year: '1989 — 1999',
    summary:
      'An engineering reverence for the cast-iron blocks, cross-flow multi-valve cylinder heads, and pneumatic harmonics that defined the zenith of analog performance.',
    content: [
      'Between 1989 and 1999, Japanese automotive engineers operated in a rare historical pocket: computer-aided finite element analysis had arrived, yet accountants and emissions homogenizers had not yet stripped engines of mechanical over-engineering.',
      'Consider the Nissan RB26DETT. Born exclusively to dominate FIA Group A touring car racing under strict displacement indexing (1.7x turbo equivalency to fit the 4,500cc class), Nissan engineers cast the cylinder block in dense cast iron with deep structural webbing. It featured individual throttle bodies (ITBs) for razor-sharp transient throttle response and a forged steel crankshaft capable of harmonics past 8,500 RPM.',
      'Across town, Honda took the opposite philosophical path with the B16A. Rather than forced induction, Kenichi Nagahiro designed the Variable Valve Timing and Lift Electronic Control (VTEC) system. At 5,800 RPM, a hydraulic spool valve routed engine oil at 60 PSI into the rocker shafts, sliding an internal synchronizer pin that locked the two mild outer intake rocker arms to a towering center high-lift cam lobe.',
      'Instantly, duration expanded from 230 to 285 degrees, intake lift jumped to 10.6mm, and the engine’s volumetric efficiency crossed 100%. The B16 produced 100 horsepower per liter in naturally aspirated form—a benchmark previously reserved for Ferrari’s race-bred V12s, achieved with bulletproof Japanese commuter reliability.',
    ],
    keyDiagramNotes: [
      {
        term: 'Hydraulic Locking Pin (VTEC)',
        definition: 'Piston-driven hardened steel pin that mechanically binds primary, secondary, and mid rocker arms under oil pressure command from the ECU.',
      },
      {
        term: 'Closed-Deck Cast Iron Block',
        definition: 'Continuous cylinder wall reinforcement surrounding coolant passages, capable of containing cylinder combustion pressures exceeding 1,200 PSI.',
      },
      {
        term: 'Equal-Length Ceramic Twin Turbos',
        definition: 'Dual T28 Garrett hybrid turbochargers with lightweight ceramic turbine wheels designed for near-instant spool up without exhaust manifold pulsation interference.',
      },
    ],
    specSheet: [
      { label: 'B16A Specific Output', value: '100 hp / Liter (Naturally Aspirated)' },
      { label: 'RB26DETT Redline Capability', value: '8,200 RPM factory, 9,500 RPM tuned' },
      { label: '2JZ-GTE Crankshaft Journal Width', value: '62mm forged steel, 7-main bearing' },
    ],
  },
];

export const INITIAL_COMPUTER_ARTICLES: ComputerArticle[] = [
  {
    id: 'osint-graph-recon',
    title: 'OSINT Graph Reconnaissance: Automated Entity Correlation',
    subtitle: 'From Distributed Tor Crawlers to NetworkX Topology Graphs',
    date: 'August 2026',
    category: 'OSINT Reconnaissance',
    philosophicalThesis:
      'Information in the digital sphere is never truly hidden; it is merely scattered across disparate ontologies until graph mathematics synthesizes the unspoken relationship.',
    body: [
      'Modern open-source intelligence cannot rely on manual web scraping. Threat actors, dark-web infrastructure, and leaked identity dumps operate as sparse matrices of pseudonymous hashes, PGP key fingerprints, and relay hops.',
      'Below is a complete, production-grade Python asynchronous reconnaissance worker. It leverages Tor socks proxy routing, cryptographic hash normalization, and NetworkX bipartite graphs to correlate leaked credentials against known infrastructure nodes in real-time.',
    ],
    codeBlocks: [
      {
        id: 'code-1',
        filename: 'entity_graph_crawler.py',
        language: 'python',
        annotations: 'Python 3.12+ with asyncio, aiohttp (SOCKS5), and NetworkX correlation',
        code: `#!/usr/bin/env python3
"""
MarkRyan OSINT Entity Graph Engine
Automated correlation pipeline across distributed relays.
"""

import asyncio
import hashlib
import json
import logging
from typing import Dict, List, Set
import networkx as nx
from aiohttp import ClientSession, ClientTimeout
from aiohttp_socks import ProxyConnector

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

class EntityGraphRecon:
    def __init__(self, tor_socks_url: str = "socks5://127.0.0.1:9050"):
        self.tor_url = tor_socks_url
        self.graph = nx.Graph()
        self.seen_hashes: Set[str] = set()

    def normalize_identifier(self, raw_entity: str) -> str:
        """Derives SHA-256 fingerprint for canonical graph node representation."""
        clean = raw_entity.strip().lower()
        return hashlib.sha256(clean.encode('utf-8')).hexdigest()[:16]

    async def probe_onion_endpoint(self, session: ClientSession, target_onion: str) -> Dict:
        """Probes dark-web endpoint headers and extracts cryptographic PGP fingerprints."""
        try:
            url = f"http://{target_onion}/.well-known/security.txt"
            async with session.get(url, timeout=ClientTimeout(total=12)) as resp:
                if resp.status == 200:
                    text = await resp.text()
                    return {"target": target_onion, "status": "active", "payload": text[:500]}
        except Exception as e:
            logging.debug(f"Relay hop timeout for {target_onion}: {e}")
        return {"target": target_onion, "status": "unreachable", "payload": ""}

    def ingest_bipartite_relationship(self, entity_id: str, artifact_type: str, related_nodes: List[str]):
        """Injects nodes and weighted ontological edges into topological graph."""
        e_hash = self.normalize_identifier(entity_id)
        self.graph.add_node(e_hash, label=entity_id, type="entity")

        for related in related_nodes:
            r_hash = self.normalize_identifier(related)
            self.graph.add_node(r_hash, label=related, type=artifact_type)
            self.graph.add_edge(e_hash, r_hash, weight=1.0)

    def export_centrality_metrics(self) -> Dict[str, float]:
        """Calculates betweenness centrality to pinpoint pivotal bridge nodes."""
        return nx.betweenness_centrality(self.graph)

if __name__ == "__main__":
    recon = EntityGraphRecon()
    recon.ingest_bipartite_relationship("operator_alpha", "gpg_key", ["4A9F21E3", "tor_node_77.onion"])
    metrics = recon.export_centrality_metrics()
    print("Graph compiled with nodes:", recon.graph.number_of_nodes())
    print("Centrality bridges:", json.dumps(metrics, indent=2))`,
      },
    ],
  },
  {
    id: 'unix-pipe-philosophy',
    title: 'The Philosophy of the UNIX Pipe: Composable Ontologies',
    subtitle: 'From Doug McIlroy’s Stdin to Algebraic Stream Monads',
    date: 'June 2026',
    category: 'Systems Philosophy',
    philosophicalThesis:
      'In a monolithic architecture, every program is a fortress. In the UNIX paradigm, every program is a sieve, and the truth lies only in what cascades between them.',
    body: [
      'In 1964, Doug McIlroy pinned a memo to the Bell Labs corkboard: "We should have ways of coupling programs like garden hose—screw in another segment when it becomes necessary to massage data in another way."',
      'The elegance of the UNIX pipe (|) is ontological simplicity: bytes in, bytes out. No schema negotiations, no protobuf compile steps, no network latency serialization overhead. It transforms computation from static inventory into dynamic river flow.',
    ],
    codeBlocks: [
      {
        id: 'code-2',
        filename: 'stream_algebra.sh',
        language: 'bash',
        annotations: 'High-throughput stream processing with zero intermediate memory allocation',
        code: `#!/usr/bin/env bash
# MarkRyan: Composable UNIX Pipeline for Realtime Kernel Trace Analysis

set -euo pipefail

# Sieve syslog kernel errors, unpack hex registers, and aggregate frequency distribution
journalctl -k --since "2 hours ago" -o cat \\
  | grep -E "(segfault|panic|general protection fault)" \\
  | awk '{ for (i=1; i<=NF; i++) if ($i ~ /^ip:0x/) print $i }' \\
  | sort \\
  | uniq -c \\
  | sort -rn \\
  | awk '{ printf "Register 0x%s -> %4d faults\\n", substr($2,6), $1 }'`,
      },
    ],
  },
];

export const INITIAL_DIARY_POSTS: DiaryPost[] = [
  {
    id: 'entry-1',
    title: 'Rain on the Skylight, Silence in the Terminal',
    date: 'September 14, 2026',
    time: '02:14 AM',
    location: 'Studio Loft, 4th Floor',
    weather: 'Heavy Autumn Downpour, 14°C',
    mood: 'Contemplative & Quiet',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=85',
    imageCaption: 'Morning cedar light through the studio frame — 16:9 crop via Vercel Blob.',
    content: `The house is completely dark except for the single phosphor glow of the monitor. Outside, the rain is beating against the glass with that rhythmic, metallic hiss that makes every clock in the room feel unnecessary.

I spent six hours today debugging an asynchronous race condition in the graph correlation crawler. At 11 PM, I found the culprit: a missing mutex lock on the socket buffer that only failed when Tor switched circuit relays during heavy TLS handshakes. A single line of code fixed it. And yet, when the build turned green, there was no triumphant burst of adrenaline—just that strange, peaceful melancholy of finishing something intricate.

Why do we write? To prove to the void that we were here on a Monday night in September, holding a mug of cold tea, looking at words and numbers, alive.`,
  },
  {
    id: 'entry-2',
    title: 'On Dostoevsky’s Solitude and Modern Hyper-Connectivity',
    date: 'September 8, 2026',
    time: '11:42 PM',
    location: 'Library Corner',
    weather: 'Cool Breeze, Clear Sky',
    mood: 'Philosophical',
    content: `Re-read White Nights this evening. What strikes me is how unhurried the heartbreak is. The characters walk along the Neva for hours, exchanging paragraphs that would take twenty text messages today to butcher.

In our era of fiber optics and millisecond latency, we have abolished distance, but we have also abolished the fertile silence where desire and contemplation actually incubate. Everything is answered before the question has even settled into the chest.

I want this diary page to remain blank, clean, unlined, and quiet. When someone steps into this room, the buttons should vanish. The margins should cease to exist. Just ink and breath.`,
  },
];

export const INITIAL_COMMENTS: BlogComment[] = [
  {
    id: 'comm-1',
    postId: 'entry-1',
    authorName: 'Elena Rostova',
    content:
      'The metaphor of the missing mutex lock and the rain on the glass resonated deeply. That strange, peaceful melancholy when code compiles at 2 AM is something only developers who care about craftsmanship know.',
    createdAt: 'September 14, 2026 &middot; 03:02 AM',
    status: 'approved',
    isAdmin: false,
  },
  {
    id: 'comm-2',
    postId: 'entry-1',
    authorName: 'MarkRyan',
    content:
      'Elena — thank you. It is rare to find someone who recognizes that code and poetry spring from the exact same human impulse to structure chaos.',
    createdAt: 'September 14, 2026 &middot; 03:15 AM',
    status: 'approved',
    isAdmin: true,
  },
  {
    id: 'comm-3',
    postId: 'entry-2',
    authorName: 'Julian Thorne',
    content:
      '“We have abolished distance, but also abolished the fertile silence.” A magnificent sentence. Keep this diary space pure; the web has far too many notification bells and sticky banners.',
    createdAt: 'September 9, 2026 &middot; 10:18 AM',
    status: 'approved',
    isAdmin: false,
  },
];

