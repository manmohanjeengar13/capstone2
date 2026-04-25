import type { HealthGrade, SubScores } from '@/types/report';
import { clamp } from '@/lib/utils';

export interface HealthScoreResult { healthScore: number; grade: HealthGrade; summary: string; subScores: SubScores; }

export function calculateHealthScore(complexityScore: number, commitScore: number, riskScore: number, weeklyVelocity: number): HealthScoreResult {
  const velocityScore=clamp(weeklyVelocity*10,0,100);
  const healthScore=clamp(Math.round(complexityScore*0.25+commitScore*0.25+(100-riskScore)*0.30+velocityScore*0.20),0,100);
  const grade: HealthGrade = healthScore>=90?'A':healthScore>=75?'B':healthScore>=60?'C':healthScore>=40?'D':'F';
  const subScores: SubScores = { complexity:Math.round(complexityScore), commits:Math.round(commitScore), risk:Math.round(riskScore), velocity:Math.round(velocityScore) };
  const descs: Record<HealthGrade,string> = { A:'This repository is in excellent health.', B:'Good engineering practices with minor improvements possible.', C:'Acceptable health but benefits from targeted improvements.', D:'Concerning patterns that should be addressed.', F:'Critical health issues requiring immediate attention.' };
  const weakMap: Record<string,string> = { complexity:'Code complexity is the primary concern — refactor large files.', commits:'Commit hygiene needs improvement — better messages and velocity.', risk:'Risk signals are elevated — address tech debt and staleness.', velocity:`Development velocity is low at ${weeklyVelocity} commits/week.` };
  const weakest=Object.entries({complexity:subScores.complexity,commits:subScores.commits,risk:100-subScores.risk,velocity:subScores.velocity}).sort((a,b)=>a[1]-b[1])[0][0];
  const riskLevel=riskScore>60?'significant':riskScore>30?'moderate':'low';
  return { healthScore, grade, summary:`${descs[grade]} ${weakMap[weakest]??''} Risk level is ${riskLevel}. Score: ${healthScore}/100 (Grade ${grade}).`, subScores };
}
