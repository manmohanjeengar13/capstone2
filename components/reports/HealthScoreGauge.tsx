'use client';
import { useEffect, useRef } from 'react';
import { scoreToHex, gradeToClasses } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { HealthGrade } from '@/types/report';

interface Props { score: number; grade: HealthGrade; size?: number; showLabel?: boolean; }

function polarToCart(cx:number, cy:number, r:number, angle:number) {
  const rad = ((angle-90)*Math.PI)/180;
  return { x: cx + r*Math.cos(rad), y: cy + r*Math.sin(rad) };
}
function arc(cx:number, cy:number, r:number, s:number, e:number) {
  const st=polarToCart(cx,cy,r,e), en=polarToCart(cx,cy,r,s);
  return `M ${st.x} ${st.y} A ${r} ${r} 0 ${e-s<=180?'0':'1'} 0 ${en.x} ${en.y}`;
}

export function HealthScoreGauge({ score, grade, size=160, showLabel=true }: Props) {
  const pathRef = useRef<SVGPathElement>(null);
  const sw = size * 0.065;
  const r = (size - sw*2) / 2;
  const cx = size / 2;
  const circ = Math.PI * r;
  const offset = circ - (score/100)*circ;
  const color = scoreToHex(score);
  const gradeLabels: Record<HealthGrade,string> = { A:'Excellent', B:'Good', C:'Fair', D:'Poor', F:'Critical' };

  useEffect(() => {
    if (!pathRef.current) return;
    pathRef.current.style.strokeDashoffset = String(circ);
    requestAnimationFrame(() => {
      if (!pathRef.current) return;
      pathRef.current.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)';
      pathRef.current.style.strokeDashoffset = String(offset);
    });
  }, [score, circ, offset]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div style={{ width:size, height:size/2+sw }}>
        <svg width={size} height={size/2+sw} viewBox={`0 0 ${size} ${size/2+sw}`} style={{overflow:'visible'}} aria-label={`Health score ${score}/100 grade ${grade}`}>
          <path d={arc(cx,cx,r,180,360)} fill="none" stroke="hsl(215 20% 16%)" strokeWidth={sw} strokeLinecap="round"/>
          <path ref={pathRef} d={arc(cx,cx,r,180,360)} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ} style={{filter:`drop-shadow(0 0 ${sw}px ${color}60)`}}/>
          <text x={cx} y={cx-4} textAnchor="middle" dominantBaseline="middle" fontSize={size*0.22} fontWeight="700" fill={color} fontFamily="var(--font-geist-mono)">{score}</text>
          <text x={cx} y={cx+size*0.14} textAnchor="middle" dominantBaseline="middle" fontSize={size*0.085} fill="hsl(215 16% 47%)" fontFamily="var(--font-geist-mono)">/ 100</text>
        </svg>
      </div>
      {showLabel && (
        <div className="flex flex-col items-center gap-1.5">
          <Badge className={cn('px-3 py-1 text-sm font-bold border', gradeToClasses(grade))}>Grade {grade}</Badge>
          <span className="text-xs text-muted-foreground">{gradeLabels[grade]}</span>
        </div>
      )}
    </div>
  );
}
