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
    // Reduc bounding box-ul pentru zoom-in și mai mult spațiu între orașe
    const europeMinLat = 40;
    const europeMaxLat = 62;
    const europeMinLng = -5;
    const europeMaxLng = 30;
    
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

        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);

          return (
            <g key={`points-${i}`}>
              <g key={`start-${i}`}>
                <motion.circle
                  cx={startPoint.x}
                  cy={startPoint.y}
                  r="6"
                  fill={lineColor}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  onMouseEnter={() => showLabels && dot.start.label && setHoveredLocation(dot.start.label)}
                  onMouseLeave={() => setHoveredLocation(null)}
                  className="cursor-pointer"
                />
                <motion.circle
                  cx={startPoint.x}
                  cy={startPoint.y}
                  r="6"
                  fill={lineColor}
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
                {showLabels && dot.start.label && (
                  <motion.g
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 + 0.2 }}
                    className="pointer-events-none"
                  >
                    <foreignObject
                      x={startPoint.x - 50}
                      y={startPoint.y - 35}
                      width="100"
                      height="30"
                      className="block"
                    >
                      <div className="flex items-center justify-center h-full">
                        <span className="text-[10px] font-medium px-1 py-0.5 rounded bg-white/90 text-black border border-gray-200 shadow-sm">
                          {dot.start.label}
                        </span>
                      </div>
                    </foreignObject>
                  </motion.g>
                )}
              </g>

              <g key={`end-${i}`}>
                <motion.circle
                  cx={endPoint.x}
                  cy={endPoint.y}
                  r="6"
                  fill={lineColor}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  onMouseEnter={() => showLabels && dot.end.label && setHoveredLocation(dot.end.label)}
                  onMouseLeave={() => setHoveredLocation(null)}
                  className="cursor-pointer"
                />
                <motion.circle
                  cx={endPoint.x}
                  cy={endPoint.y}
                  r="6"
                  fill={lineColor}
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
                {showLabels && dot.end.label && (
                  <motion.g
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 + 0.2 }}
                    className="pointer-events-none"
                  >
                    <foreignObject
                      x={endPoint.x - 50}
                      y={endPoint.y - 35}
                      width="100"
                      height="30"
                      className="block"
                    >
                      <div className="flex items-center justify-center h-full">
                        <span className="text-[10px] font-medium px-1 py-0.5 rounded bg-white/90 text-black border border-gray-200 shadow-sm">
                          {dot.end.label}
                        </span>
                      </div>
                    </foreignObject>
                  </motion.g>
                )}
              </g>
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
