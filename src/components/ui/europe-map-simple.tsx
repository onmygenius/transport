"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
  showLabels?: boolean;
  animationDuration?: number;
  loop?: boolean;
}

export function EuropeMap({ 
  dots = [], 
  lineColor = "#f59e0b",
  showLabels = true,
  animationDuration = 2,
  loop = true
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  const projectPoint = (lat: number, lng: number) => {
    // Bounding box extins pentru a include toate porturile maritime europene
    // Sud: Algeciras (36°), Nord: Helsinki (60.17°), Oslo (59.91°), Vest: Lisbon (-9°), Est: Mersin (34.64°)
    const europeMinLat = 35;
    const europeMaxLat = 61.5;
    const europeMinLng = -10;
    const europeMaxLng = 35;
    
    const x = ((lng - europeMinLng) / (europeMaxLng - europeMinLng)) * 800;
    const y = ((europeMaxLat - lat) / (europeMaxLat - europeMinLat)) * 400;
    
    return { x, y };
  };

  const createCurvedPath = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2 - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  const staggerDelay = 0.3;
  const totalAnimationTime = dots.length * staggerDelay + animationDuration;
  const pauseTime = 2;
  const fullCycleDuration = totalAnimationTime + pauseTime;

  // Colectez toate porturile unice din rute
  const uniquePorts = new Map<string, { lat: number; lng: number; label: string }>();
  dots.forEach(dot => {
    if (dot.start.label) {
      uniquePorts.set(dot.start.label, { lat: dot.start.lat, lng: dot.start.lng, label: dot.start.label });
    }
    if (dot.end.label) {
      uniquePorts.set(dot.end.label, { lat: dot.end.lat, lng: dot.end.lng, label: dot.end.label });
    }
  });
  const allPorts = Array.from(uniquePorts.values());
  
  // Poziționare etichete pentru a evita suprapunerea
  // Format: portName -> position ('top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right')
  const labelPositions: Record<string, string> = {
    // Nord Europa - alternăm sus/jos
    'Rotterdam': 'top',
    'Antwerp': 'bottom',
    'Hamburg': 'top',
    'Bremerhaven': 'bottom',
    'Amsterdam': 'top-right',
    'Zeebrugge': 'bottom-left',
    'Felixstowe': 'top',
    'Southampton': 'bottom',
    'London Gateway': 'right',
    'Le Havre': 'bottom',
    'Dunkirk': 'top-left',
    
    // Scandinavia & Baltic - etichetele nordice jos pentru a nu fi tăiate
    'Oslo': 'bottom',
    'Gothenburg': 'bottom',
    'Stockholm': 'bottom',
    'Copenhagen': 'bottom',
    'Aarhus': 'bottom-right',
    'Helsinki': 'bottom',
    'Tallinn': 'bottom-right',
    'Riga': 'bottom',
    'Klaipeda': 'bottom',
    'Gdansk': 'bottom',
    'Gdynia': 'top',
    
    // Mediterana de Vest
    'Lisbon': 'left',
    'Sines': 'bottom',
    'Leixoes': 'top',
    'Algeciras': 'bottom',
    'Valencia': 'bottom',
    'Barcelona': 'top',
    'Bilbao': 'top',
    'Marseille': 'bottom',
    
    // Mediterana Centrală
    'Genova': 'top',
    'La Spezia': 'bottom',
    'Livorno': 'top',
    'Naples': 'bottom',
    'Gioia Tauro': 'bottom',
    'Trieste': 'top',
    'Venice': 'bottom',
    
    // Adriatic
    'Koper': 'top-left',
    'Rijeka': 'bottom',
    
    // Mediterana de Est
    'Piraeus': 'bottom',
    'Thessaloniki': 'top',
    
    // Marea Neagră
    'Constanta': 'top',
    'Varna': 'bottom',
    'Burgas': 'bottom-left',
    
    // Turcia
    'Istanbul': 'top',
    'Izmir': 'top',
    'Mersin': 'top',
  };
  
  const getLabelPosition = (portName: string) => {
    return labelPositions[portName] || 'top';
  };
  
  const getLabelOffset = (position: string) => {
    const offsets: Record<string, { x: number; y: number }> = {
      'top': { x: -60, y: -32 },
      'bottom': { x: -60, y: 10 },
      'left': { x: -130, y: -14 },
      'right': { x: 10, y: -14 },
      'top-left': { x: -130, y: -32 },
      'top-right': { x: 10, y: -32 },
      'bottom-left': { x: -130, y: 10 },
      'bottom-right': { x: 10, y: 10 },
    };
    return offsets[position] || offsets['top'];
  };

  return (
    <div className="w-full aspect-[2/1] md:aspect-[2.5/1] lg:aspect-[2/1] bg-white rounded-lg relative font-sans overflow-hidden">
      <div 
        className="absolute inset-0 flex items-center justify-center opacity-5"
        style={{
          backgroundImage: 'url(/logo-site.png)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-auto select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          const startTime = (i * staggerDelay) / fullCycleDuration;
          const endTime = (i * staggerDelay + animationDuration) / fullCycleDuration;
          const resetTime = (totalAnimationTime + pauseTime) / fullCycleDuration;

          return (
            <g key={`route-${i}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={loop ? {
                  pathLength: [null, 0, 1, 1, 1],
                  opacity: [0, 0, 1, 0, 0],
                } : { pathLength: 1, opacity: 1 }}
                transition={loop ? {
                  duration: fullCycleDuration,
                  times: [0, startTime, endTime, resetTime, 1],
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 0,
                } : {
                  duration: animationDuration,
                  delay: i * staggerDelay,
                  ease: "easeInOut",
                }}
              />

              {loop && (
                <motion.circle
                  r="4"
                  fill={lineColor}
                  initial={{ offsetDistance: "0%", opacity: 0 }}
                  animate={{
                    offsetDistance: [null, "0%", "100%", "100%", "100%"],
                    opacity: [0, 0, 1, 0, 0],
                  }}
                  transition={{
                    duration: fullCycleDuration,
                    times: [0, startTime, endTime, resetTime, 1],
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 0,
                  }}
                  style={{
                    offsetPath: `path('${createCurvedPath(startPoint, endPoint)}')`,
                  }}
                />
              )}
            </g>
          );
        })}

        {allPorts.map((port, i) => {
          const point = projectPoint(port.lat, port.lng);

          return (
            <g key={`port-${port.label}`}>
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill={lineColor}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onMouseEnter={() => showLabels && setHoveredLocation(port.label)}
                onMouseLeave={() => setHoveredLocation(null)}
                className="cursor-pointer"
              />
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill={lineColor}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.05,
                }}
              />
              {showLabels && (() => {
                const position = getLabelPosition(port.label);
                const offset = getLabelOffset(position);
                return (
                  <motion.g
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 + 0.2 }}
                    className="pointer-events-none"
                  >
                    <foreignObject
                      x={point.x + offset.x}
                      y={point.y + offset.y}
                      width="120"
                      height="28"
                      className="block"
                    >
                      <div className="flex items-center justify-center h-full">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/95 text-gray-900 border border-gray-300 shadow-md whitespace-nowrap">
                          {port.label}
                        </span>
                      </div>
                    </foreignObject>
                  </motion.g>
                );
              })()}
            </g>
          );
        })}
      </svg>

      <AnimatePresence>
        {hoveredLocation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 bg-white/90 text-black px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm sm:hidden border border-gray-200"
          >
            {hoveredLocation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
