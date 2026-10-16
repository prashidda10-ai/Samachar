// Preset curated media and logos with embedded SVGs for complete offline capability

export interface SampleMediaItem {
  id: string;
  name: string;
  category: 'politics' | 'nature' | 'business' | 'culture' | 'infrastructure' | 'viral';
  dataUrl: string;
}

// Crisp stylized SVG data URLs for news backgrounds
export const SAMPLE_NEWS_IMAGES: SampleMediaItem[] = [
  {
    id: 'mustang-apples',
    name: 'मुस्ताङको स्याउ (Mustang Apples)',
    category: 'nature',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#38bdf8"/>
            <stop offset="60%" stop-color="#bae6fd"/>
            <stop offset="100%" stop-color="#e0f2fe"/>
          </linearGradient>
          <linearGradient id="mountain1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="50%" stop-color="#cbd5e1"/>
            <stop offset="100%" stop-color="#64748b"/>
          </linearGradient>
          <linearGradient id="mountain2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f8fafc"/>
            <stop offset="60%" stop-color="#94a3b8"/>
            <stop offset="100%" stop-color="#475569"/>
          </linearGradient>
          <linearGradient id="orchard" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#15803d"/>
            <stop offset="100%" stop-color="#14532d"/>
          </linearGradient>
          <radialGradient id="apple" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#ff4d4d"/>
            <stop offset="60%" stop-color="#dc2626"/>
            <stop offset="100%" stop-color="#991b1b"/>
          </radialGradient>
        </defs>
        <rect width="1200" height="900" fill="url(#sky)"/>
        <!-- Himalayan Peaks -->
        <polygon points="50,550 320,180 580,550" fill="url(#mountain1)"/>
        <polygon points="320,180 430,320 580,550" fill="#94a3b8" opacity="0.6"/>
        <polygon points="400,550 720,120 1050,550" fill="url(#mountain2)"/>
        <polygon points="720,120 860,280 1050,550" fill="#64748b" opacity="0.5"/>
        <polygon points="850,550 1100,240 1200,550" fill="url(#mountain1)"/>
        <!-- Green Apple Orchard Foreground -->
        <rect y="480" width="1200" height="420" fill="url(#orchard)"/>
        <path d="M0,520 Q300,470 600,510 T1200,490 L1200,900 L0,900 Z" fill="#166534" opacity="0.7"/>
        <!-- Foliage & Branches -->
        <g stroke="#3f2e18" stroke-width="12" stroke-linecap="round">
          <path d="M200,900 Q260,600 400,520"/>
          <path d="M300,640 Q450,600 520,530"/>
          <path d="M850,900 Q800,620 680,500"/>
          <path d="M780,650 Q660,600 590,560"/>
        </g>
        <!-- Ripe Apples with Highlights -->
        <circle cx="340" cy="540" r="55" fill="url(#apple)"/>
        <circle cx="430" cy="510" r="48" fill="url(#apple)"/>
        <circle cx="510" cy="560" r="52" fill="url(#apple)"/>
        <circle cx="680" cy="520" r="58" fill="url(#apple)"/>
        <circle cx="760" cy="570" r="46" fill="url(#apple)"/>
        <circle cx="860" cy="530" r="50" fill="url(#apple)"/>
        <circle cx="280" cy="620" r="42" fill="url(#apple)"/>
      </svg>
    `)}`
  },
  {
    id: 'balen-podium',
    name: 'काठमाडौँ महानगर / बालेन शाह (Kathmandu City)',
    category: 'politics',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0f172a"/>
            <stop offset="50%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#020617"/>
          </linearGradient>
          <linearGradient id="suit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1e1e24"/>
            <stop offset="100%" stop-color="#0a0a0c"/>
          </linearGradient>
          <radialGradient id="micGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="1200" height="900" fill="url(#bg)"/>
        <!-- Studio / Press Room bokeh lights -->
        <circle cx="200" cy="200" r="140" fill="#3b82f6" opacity="0.15" filter="blur(40px)"/>
        <circle cx="950" cy="250" r="180" fill="#ef4444" opacity="0.12" filter="blur(40px)"/>
        <!-- Flag backdrop hints -->
        <path d="M100,50 L260,240 L160,240 L300,420 L100,420 Z" fill="#dc2626" opacity="0.25"/>
        <!-- Speaker Silhouette (Daura Suruwal & Dhaka Topi) -->
        <g transform="translate(600, 480)">
          <!-- Shoulders and Coat -->
          <path d="M-280,420 C-260,200 -180,120 -80,90 L80,90 C180,120 260,200 280,420 Z" fill="url(#suit)"/>
          <!-- White Patuka / Daura Collar -->
          <polygon points="-50,90 0,160 50,90" fill="#f8fafc"/>
          <line x1="0" y1="90" x2="0" y2="300" stroke="#f1f5f9" stroke-width="3"/>
          <!-- Neck & Head -->
          <rect x="-45" y="10" width="90" height="90" rx="15" fill="#fbcfe8"/>
          <ellipse cx="0" cy="-20" rx="75" ry="90" fill="#fbcfe8"/>
          <!-- Dhaka Topi (Traditional Nepali Cap) -->
          <path d="M-78,-40 Q0,-120 78,-40 L70,-10 L-70,-10 Z" fill="#b91c1c"/>
          <polygon points="-60,-35 0,-105 60,-35" fill="#1e1b4b" opacity="0.5"/>
          <!-- Sunglasses / Glasses -->
          <rect x="-65" y="-30" width="55" height="28" rx="8" fill="#09090b"/>
          <rect x="10" y="-30" width="55" height="28" rx="8" fill="#09090b"/>
          <line x1="-10" y1="-18" x2="10" y2="-18" stroke="#09090b" stroke-width="4"/>
          <!-- Beard / Trimmed Hair -->
          <path d="M-65,-10 C-65,60 -30,80 0,82 C30,80 65,60 65,-10 C45,10 -45,10 -65,-10 Z" fill="#18181b"/>
        </g>
        <!-- Press Podium & Microphones in foreground -->
        <rect x="420" y="680" width="360" height="220" rx="10" fill="#27272a" stroke="#3f3f46" stroke-width="4"/>
        <rect x="460" y="700" width="280" height="30" rx="6" fill="#18181b"/>
        <!-- Gooseneck Mics -->
        <path d="M480,680 Q510,580 540,540" stroke="#71717a" stroke-width="8" fill="none"/>
        <ellipse cx="540" cy="540" rx="12" ry="18" fill="#09090b" stroke="#a1a1aa" stroke-width="2"/>
        <path d="M720,680 Q690,570 650,535" stroke="#71717a" stroke-width="8" fill="none"/>
        <ellipse cx="650" cy="535" rx="12" ry="18" fill="#09090b" stroke="#a1a1aa" stroke-width="2"/>
      </svg>
    `)}`
  },
  {
    id: 'kulman-energy',
    name: 'विद्युत र ऊर्जा (Electricity & Hydropower)',
    category: 'business',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
        <defs>
          <linearGradient id="hydrosky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0369a1"/>
            <stop offset="60%" stop-color="#0284c7"/>
            <stop offset="100%" stop-color="#38bdf8"/>
          </linearGradient>
          <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#e0f2fe"/>
            <stop offset="50%" stop-color="#38bdf8"/>
            <stop offset="100%" stop-color="#0284c7"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="900" fill="url(#hydrosky)"/>
        <!-- River Valley Mountains -->
        <polygon points="0,500 240,250 500,500" fill="#15803d"/>
        <polygon points="700,500 980,220 1200,500" fill="#166534"/>
        <polygon points="300,500 620,180 900,500" fill="#14532d"/>
        <!-- Massive Concrete Dam -->
        <polygon points="200,650 350,420 850,420 1000,650" fill="#cbd5e1" stroke="#94a3b8" stroke-width="4"/>
        <!-- Spillway Water Flow -->
        <polygon points="450,420 400,750 800,750 750,420" fill="url(#water)"/>
        <path d="M400,750 Q600,700 800,750 L850,900 L350,900 Z" fill="#0284c7"/>
        <!-- Transmission Tower / Pylon High Voltage -->
        <g stroke="#f8fafc" stroke-width="5" fill="none">
          <line x1="950" y1="700" x2="1020" y2="350"/>
          <line x1="1090" y1="700" x2="1020" y2="350"/>
          <line x1="970" y1="620" x2="1070" y2="620"/>
          <line x1="990" y1="520" x2="1050" y2="520"/>
          <line x1="1005" y1="440" x2="1035" y2="440"/>
          <!-- Cross bars -->
          <line x1="940" y1="470" x2="1100" y2="470" stroke-width="8"/>
          <line x1="920" y1="400" x2="1120" y2="400" stroke-width="8"/>
        </g>
        <!-- Power Sparks -->
        <circle cx="920" cy="400" r="16" fill="#facc15" opacity="0.8"/>
        <circle cx="1120" cy="400" r="16" fill="#facc15" opacity="0.8"/>
      </svg>
    `)}`
  },
  {
    id: 'kathmandu-heritage',
    name: 'काठमाडौँ सम्पदा (Kathmandu Heritage)',
    category: 'culture',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
        <defs>
          <linearGradient id="twilight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ea580c"/>
            <stop offset="40%" stop-color="#f59e0b"/>
            <stop offset="80%" stop-color="#fef08a"/>
            <stop offset="100%" stop-color="#fed7aa"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="900" fill="url(#twilight)"/>
        <!-- Sun disc -->
        <circle cx="600" cy="380" r="120" fill="#fff7ed" opacity="0.9"/>
        <!-- Pagoda Temple Tier 3 -->
        <polygon points="560,240 600,190 640,240" fill="#78350f"/>
        <path d="M520,270 Q600,240 680,270 L600,220 Z" fill="#b45309"/>
        <!-- Tier 2 -->
        <rect x="540" y="270" width="120" height="60" fill="#78350f"/>
        <path d="M460,360 Q600,310 740,360 L600,290 Z" fill="#9a3412"/>
        <!-- Tier 1 Base -->
        <rect x="500" y="360" width="200" height="110" fill="#78350f"/>
        <path d="M380,500 Q600,430 820,500 L600,400 Z" fill="#7c2d12"/>
        <!-- Temple Brick Plinth Multi-step Base -->
        <polygon points="340,650 440,500 760,500 860,650" fill="#991b1b"/>
        <polygon points="260,780 340,650 860,650 940,780" fill="#7f1d1d"/>
        <rect y="780" width="1200" height="120" fill="#450a0a"/>
        <!-- Prayer flags string (Lungta) -->
        <path d="M50,150 Q300,260 600,200 Q900,260 1150,140" stroke="#475569" stroke-width="2" fill="none"/>
        <polygon points="120,180 150,185 135,225" fill="#3b82f6"/>
        <polygon points="200,205 230,210 215,250" fill="#ffffff"/>
        <polygon points="280,225 310,228 295,268" fill="#ef4444"/>
        <polygon points="360,230 390,230 375,270" fill="#22c55e"/>
        <polygon points="440,220 470,218 455,258" fill="#eab308"/>
      </svg>
    `)}`
  },
  {
    id: 'helicopter-rescue',
    name: 'हेलिकप्टर उद्धार / दुर्गम यात्रा (Helicopter Flight)',
    category: 'viral',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
        <defs>
          <linearGradient id="clouds" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0284c7"/>
            <stop offset="60%" stop-color="#7dd3fc"/>
            <stop offset="100%" stop-color="#f0f9ff"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="900" fill="url(#clouds)"/>
        <!-- Mountain Ridges -->
        <polygon points="0,700 300,450 700,720 1200,400 1200,900 0,900" fill="#475569"/>
        <polygon points="0,800 450,560 900,820 1200,600 1200,900 0,900" fill="#1e293b"/>
        <!-- Helicopter Body in Flight -->
        <g transform="translate(600, 380)">
          <!-- Main Rotor Spin Blur -->
          <ellipse cx="0" cy="-90" rx="280" ry="20" fill="#ffffff" opacity="0.4"/>
          <line x1="-280" y1="-90" x2="280" y2="-90" stroke="#0f172a" stroke-width="4" opacity="0.5"/>
          <!-- Rotor Shaft -->
          <rect x="-6" y="-90" width="12" height="40" fill="#334155"/>
          <!-- Cabin Fuselage -->
          <path d="M-130,-50 C-70,-70 90,-70 150,-30 C190,-5 180,30 140,50 C90,70 -80,70 -130,40 C-170,10 -170,-20 -130,-50 Z" fill="#dc2626"/>
          <!-- Cockpit Windshield -->
          <path d="M70,-50 C120,-45 160,-20 160,0 C160,20 130,35 80,40 Z" fill="#0284c7" opacity="0.8"/>
          <!-- Tail Boom -->
          <polygon points="-130,-20 -380,-10 -380,-30 -130,-40" fill="#ef4444"/>
          <!-- Tail Fin & Tail Rotor -->
          <polygon points="-380,-10 -410,-80 -360,-20" fill="#b91c1c"/>
          <ellipse cx="-400" cy="-60" rx="30" ry="30" fill="#e2e8f0" opacity="0.4"/>
          <!-- Landing Skids -->
          <line x1="-80" y1="50" x2="-80" y2="90" stroke="#1e293b" stroke-width="8"/>
          <line x1="80" y1="50" x2="80" y2="90" stroke="#1e293b" stroke-width="8"/>
          <line x1="-120" y1="90" x2="140" y2="90" stroke="#0f172a" stroke-width="12" stroke-linecap="round"/>
        </g>
      </svg>
    `)}`
  },
  {
    id: 'nepal-cricket',
    name: 'नेपाली क्रिकेट / TU मैदान (Nepal Cricket Arena)',
    category: 'viral',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
        <defs>
          <linearGradient id="cricketSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0284c7"/>
            <stop offset="100%" stop-color="#38bdf8"/>
          </linearGradient>
          <linearGradient id="pitch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#22c55e"/>
            <stop offset="100%" stop-color="#15803d"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="900" fill="url(#cricketSky)"/>
        <!-- Stadium Floodlight Glows -->
        <circle cx="200" cy="180" r="120" fill="#fef08a" opacity="0.3"/>
        <circle cx="1000" cy="180" r="120" fill="#fef08a" opacity="0.3"/>
        <!-- Green Outfield -->
        <ellipse cx="600" cy="720" rx="750" ry="340" fill="url(#pitch)"/>
        <!-- Cricket Wicket & Stumps in Center -->
        <rect x="520" y="520" width="160" height="300" fill="#ca8a04" opacity="0.8"/>
        <rect x="575" y="440" width="10" height="120" fill="#fef08a"/>
        <rect x="595" y="440" width="10" height="120" fill="#fef08a"/>
        <rect x="615" y="440" width="10" height="120" fill="#fef08a"/>
        <rect x="570" y="435" width="60" height="8" fill="#ca8a04"/>
        <!-- Red Leather Cricket Ball with Seam -->
        <circle cx="680" cy="540" r="45" fill="#dc2626"/>
        <circle cx="665" cy="525" r="12" fill="#ffffff" opacity="0.4"/>
        <path d="M640,540 Q680,520 720,540" stroke="#ffffff" stroke-width="4" stroke-dasharray="3,3" fill="none"/>
        <!-- Cheering Crowd Silhouette with Nepal Flags -->
        <path d="M0,450 Q300,410 600,430 Q900,410 1200,450 L1200,600 L0,600 Z" fill="#0f172a" opacity="0.6"/>
        <polygon points="350,380 400,410 370,410 410,450 350,450" fill="#ef4444"/>
        <polygon points="850,380 900,410 870,410 910,450 850,450" fill="#ef4444"/>
      </svg>
    `)}`
  },
  {
    id: 'investigation-court',
    name: 'विशेष अनुसन्धान / सिंहदरबार (Supreme Court & Law)',
    category: 'politics',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
        <defs>
          <linearGradient id="darkBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#09090b"/>
            <stop offset="60%" stop-color="#18181b"/>
            <stop offset="100%" stop-color="#020617"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="900" fill="url(#darkBg)"/>
        <!-- Dramatic Blue & Amber Spotlights -->
        <polygon points="600,0 300,900 900,900" fill="#38bdf8" opacity="0.08"/>
        <polygon points="1200,0 800,900 1200,900" fill="#ef4444" opacity="0.06"/>
        <!-- Justice Scales Silhouette -->
        <g transform="translate(600, 360)">
          <!-- Pillar -->
          <rect x="-12" y="-140" width="24" height="280" fill="#d4d4d8"/>
          <!-- Beam -->
          <line x1="-180" y1="-120" x2="180" y2="-120" stroke="#d4d4d8" stroke-width="14" stroke-linecap="round"/>
          <circle cx="0" cy="-120" r="22" fill="#eab308"/>
          <!-- Left Pan -->
          <line x1="-160" y1="-120" x2="-220" y2="-20" stroke="#a1a1aa" stroke-width="4"/>
          <line x1="-160" y1="-120" x2="-100" y2="-20" stroke="#a1a1aa" stroke-width="4"/>
          <path d="M-240,-20 Q-160,40 -80,-20 Z" fill="#eab308"/>
          <!-- Right Pan -->
          <line x1="160" y1="-120" x2="100" y2="-10" stroke="#a1a1aa" stroke-width="4"/>
          <line x1="160" y1="-120" x2="220" y2="-10" stroke="#a1a1aa" stroke-width="4"/>
          <path d="M80,-10 Q160,50 240,-10 Z" fill="#eab308"/>
          <!-- Base -->
          <polygon points="-80,140 80,140 120,180 -120,180" fill="#71717a"/>
        </g>
      </svg>
    `)}`
  }
];

// Preset Media Brand Logos (Authentic style matching RONB, 24 Ghanta, Nepal 360, etc.)
export interface PresetLogo {
  id: string;
  name: string;
  dataUrl: string;
}

export const PRESET_LOGOS: PresetLogo[] = [
  {
    id: 'ronb-style',
    name: 'RONB Red Ring',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ef4444"/>
            <stop offset="50%" stop-color="#dc2626"/>
            <stop offset="100%" stop-color="#eab308"/>
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="92" fill="#09090b" stroke="url(#ring)" stroke-width="12"/>
        <text x="100" y="112" font-family="'Outfit', 'Impact', sans-serif" font-weight="900" font-size="44" fill="#ffffff" text-anchor="middle" letter-spacing="2">RONB</text>
        <path d="M45,130 Q100,145 155,130" stroke="#ef4444" stroke-width="4" fill="none"/>
      </svg>
    `)}`
  },
  {
    id: 'nepal360-style',
    name: 'Nepal 360 Badge',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <circle cx="100" cy="100" r="92" fill="#dc2626"/>
        <text x="100" y="95" font-family="'Outfit', sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="middle">Nepal</text>
        <text x="100" y="135" font-family="'Outfit', sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle">360</text>
      </svg>
    `)}`
  },
  {
    id: 'ghanta-24-style',
    name: '२४ Ghanta News',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <circle cx="100" cy="100" r="92" fill="#09090b" stroke="#e11d48" stroke-width="8"/>
        <text x="100" y="118" font-family="'Mukta', 'Noto Sans Devanagari', sans-serif" font-weight="900" font-size="62" fill="#ef4444" text-anchor="middle">२४.</text>
        <text x="100" y="152" font-family="'Outfit', sans-serif" font-weight="800" font-size="14" fill="#ffffff" text-anchor="middle" letter-spacing="2">GHANTA</text>
      </svg>
    `)}`
  },
  {
    id: 'nepal-live-crest',
    name: 'NEPAL LIVE HD',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <circle cx="100" cy="100" r="92" fill="#0f172a" stroke="#e11d48" stroke-width="8"/>
        <circle cx="100" cy="100" r="80" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6,4"/>
        <text x="100" y="94" font-family="'Khand', 'Outfit', sans-serif" font-weight="900" font-size="32" fill="#ffffff" text-anchor="middle" letter-spacing="1">NEPAL</text>
        <text x="100" y="125" font-family="'Outfit', sans-serif" font-weight="800" font-size="22" fill="#e11d48" text-anchor="middle" letter-spacing="4">LIVE</text>
        <circle cx="100" cy="148" r="5" fill="#22c55e"/>
      </svg>
    `)}`
  },
  {
    id: 'dainik-nepal-badge',
    name: 'दैनिक नेपाल (Daily)',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <circle cx="100" cy="100" r="92" fill="#b91c1c" stroke="#fef08a" stroke-width="6"/>
        <text x="100" y="98" font-family="'Rozha One', 'Mukta', serif" font-weight="900" font-size="32" fill="#ffffff" text-anchor="middle">दैनिक</text>
        <text x="100" y="132" font-family="'Mukta', sans-serif" font-weight="800" font-size="26" fill="#fef08a" text-anchor="middle">नेपाल</text>
      </svg>
    `)}`
  }
];

export const NEPALI_TAG_PRESETS = [
  'ताजा अपडेट',
  'विशेष समाचार',
  'ब्रेकिङ न्युज',
  'खुसीको खबर',
  'दुःखद खबर',
  'मौसम अपडेट',
  'खेलकुद',
  'शेयर बजार',
  'अन्तर्राष्ट्रिय',
  'भाइरल भिडियो',
  'काठमाडौँ विशेष',
  'सरकारको निर्णय',
  'PLOT TWIST!',
  'AMAZING!',
  'JUST IN !'
];
