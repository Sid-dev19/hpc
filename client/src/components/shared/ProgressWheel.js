// components/shared/ProgressWheel.js
// Interactive SVG wheel — 3 abilities × 3 rings (teacher/student/peer) × 3 levels (B/P/A)
import { useMemo } from 'react';

const LEVEL_FILL = { Beginner: 0.33, Proficient: 0.66, Advanced: 1.0 };
const ABILITY_COLORS = {
  Awareness:   { fill:'#ED93B1', stroke:'#D4537E', label:'#993556' },
  Sensitivity: { fill:'#FAC775', stroke:'#BA7517', label:'#633806' },
  Creativity:  { fill:'#AFA9EC', stroke:'#7F77DD', label:'#3C3489' },
};

// SVG arc path helper
function describeArc(cx, cy, r, startAngle, endAngle, fillRatio) {
  const actualEnd = startAngle + (endAngle - startAngle) * fillRatio;
  const toRad = (deg) => (deg - 90) * Math.PI / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(actualEnd));
  const y2 = cy + r * Math.sin(toRad(actualEnd));
  const largeArc = (actualEnd - startAngle) > 180 ? 1 : 0;
  return { d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`, end: actualEnd };
}

// Ability occupies 120° each: Awareness 0-120, Sensitivity 120-240, Creativity 240-360
const ABILITY_SEGMENTS = {
  Awareness:   { start:  0, end: 120 },
  Sensitivity: { start:120, end: 240 },
  Creativity:  { start:240, end: 360 },
};

// Ring radii: inner=teacher(30-55), mid=student(58-83), outer=peer(86-111)
const RINGS = {
  teacher: { r1: 30, r2: 54 },
  student: { r1: 57, r2: 81 },
  peer:    { r1: 84, r2: 108 },
};

export default function ProgressWheel({ teacherData, studentData, peerData, size = 280, onSegmentClick }) {
  const cx = size / 2, cy = size / 2;

  const ringData = useMemo(() => ({
    teacher: teacherData || {},
    student: studentData || {},
    peer:    peerData    || {},
  }), [teacherData, studentData, peerData]);

  const segments = [];
  const BG_OPACITY = 0.18;
  const FILL_OPACITY = 0.82;

  Object.entries(ABILITY_SEGMENTS).forEach(([ability, { start, end }]) => {
    const color = ABILITY_COLORS[ability];
    Object.entries(RINGS).forEach(([ringName, { r1, r2 }]) => {
      const level = ringData[ringName]?.[`${ability.toLowerCase()}Level`];
      const fillRatio = level ? (LEVEL_FILL[level] || 0) : 0;

      // Background slice (full, faint)
      const bgOuter = describeArc(cx, cy, r2, start, end, 1);
      const bgInner = describeArc(cx, cy, r1, end, start, 1);
      segments.push(
        <path key={`bg-${ability}-${ringName}`}
          d={`${bgOuter.d} L ${cx + r1 * Math.cos((end - 90) * Math.PI / 180)} ${cy + r1 * Math.sin((end - 90) * Math.PI / 180)} A ${r1} ${r1} 0 1 0 ${cx + r1 * Math.cos((start - 90) * Math.PI / 180)} ${cy + r1 * Math.sin((start - 90) * Math.PI / 180)} Z`}
          fill={color.fill} opacity={BG_OPACITY}
        />
      );

      // Filled slice (based on level)
      if (fillRatio > 0) {
        // Use a donut arc approach: outer arc + back inner arc
        const toRad = (d) => (d - 90) * Math.PI / 180;
        const fillEnd = start + (end - start) * fillRatio;
        const largeArc = (fillEnd - start) > 180 ? 1 : 0;
        const ox1 = cx + r2 * Math.cos(toRad(start)),  oy1 = cy + r2 * Math.sin(toRad(start));
        const ox2 = cx + r2 * Math.cos(toRad(fillEnd)), oy2 = cy + r2 * Math.sin(toRad(fillEnd));
        const ix1 = cx + r1 * Math.cos(toRad(fillEnd)), iy1 = cy + r1 * Math.sin(toRad(fillEnd));
        const ix2 = cx + r1 * Math.cos(toRad(start)),   iy2 = cy + r1 * Math.sin(toRad(start));
        const d = `M ${ox1} ${oy1} A ${r2} ${r2} 0 ${largeArc} 1 ${ox2} ${oy2} L ${ix1} ${iy1} A ${r1} ${r1} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
        segments.push(
          <path key={`fill-${ability}-${ringName}`} d={d}
            fill={color.fill} opacity={FILL_OPACITY}
            style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
            onClick={() => onSegmentClick?.({ ability, ring: ringName, level })}
          />
        );
      }
    });
  });

  // Divider lines between abilities
  const dividers = Object.values(ABILITY_SEGMENTS).map(({ start }) => {
    const toRad = (d) => (d - 90) * Math.PI / 180;
    return (
      <line key={`div-${start}`}
        x1={cx} y1={cy}
        x2={cx + RINGS.peer.r2 * Math.cos(toRad(start))}
        y2={cy + RINGS.peer.r2 * Math.sin(toRad(start))}
        stroke="var(--bg-primary)" strokeWidth="1.5"
      />
    );
  });

  // Ring boundary circles
  const circles = Object.values(RINGS).flatMap(({ r1, r2 }) => [
    <circle key={`c-${r1}`} cx={cx} cy={cy} r={r1} fill="none" stroke="var(--bg-primary)" strokeWidth="1.5" />,
    <circle key={`c-${r2}`} cx={cx} cy={cy} r={r2} fill="none" stroke="var(--bg-primary)" strokeWidth="1.5" />,
  ]);

  // Ability labels
  const abilityLabels = Object.entries(ABILITY_SEGMENTS).map(([ability, { start, end }]) => {
    const midAngle = (start + end) / 2;
    const toRad = (d) => (d - 90) * Math.PI / 180;
    const labelR = RINGS.peer.r2 + 16;
    const x = cx + labelR * Math.cos(toRad(midAngle));
    const y = cy + labelR * Math.sin(toRad(midAngle));
    return (
      <text key={ability} x={x} y={y}
        textAnchor="middle" dominantBaseline="central"
        fontSize="11" fontWeight="600" fill={ABILITY_COLORS[ability].label}>
        {ability}
      </text>
    );
  });

  // Ring labels (T/S/P) — shown at top of Awareness segment
  const ringLabels = [
    { ring:'teacher', r:42,  label:'T' },
    { ring:'student', r:69,  label:'S' },
    { ring:'peer',    r:96,  label:'P' },
  ].map(({ ring, r, label }) => {
    const toRad = (d) => (d - 90) * Math.PI / 180;
    const angle = 60; // inside Awareness segment midpoint
    return (
      <text key={ring}
        x={cx + r * Math.cos(toRad(angle))}
        y={cy + r * Math.sin(toRad(angle))}
        textAnchor="middle" dominantBaseline="central"
        fontSize="9" fill="var(--text-tertiary)">
        {label}
      </text>
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display:'block' }}>
      {segments}
      {circles}
      {dividers}
      {abilityLabels}
      {ringLabels}
      {/* Center circle */}
      <circle cx={cx} cy={cy} r={28} fill="var(--bg-primary)" stroke="var(--border-light)" strokeWidth="0.5" />
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="8" fill="var(--text-tertiary)">Progress</text>
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="8" fill="var(--text-tertiary)">Wheel</text>
    </svg>
  );
}
