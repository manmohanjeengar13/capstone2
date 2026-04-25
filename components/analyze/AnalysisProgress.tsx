// components/analyze/AnalysisProgress.tsx
'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Props {
  progress: number;
  currentStep: string;
  status: string;
  onCancel?: () => void;
}

function DNAHelix() {
  const colors = [
    ['#3b82f6','#10b981'],['#10b981','#3b82f6'],['#8b5cf6','#3b82f6'],['#3b82f6','#8b5cf6'],
    ['#06b6d4','#10b981'],['#10b981','#06b6d4'],['#3b82f6','#ec4899'],['#ec4899','#3b82f6'],
  ];
  return (
    <div className="relative flex items-center justify-center py-4" aria-hidden="true">
      <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl scale-150" />
      <div className="flex items-center gap-2 relative">
        {colors.map(([c1, c2], i) => (
          <div key={i} className="dna-strand" style={{ animationDelay:`${i*0.175}s` }}>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor:c1, boxShadow:`0 0 10px ${c1}80` }} />
            <div className="w-0.5 h-6 mx-auto rounded-full" style={{ background:`linear-gradient(to bottom, ${c1}50, ${c2}50)` }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor:c2, boxShadow:`0 0 10px ${c2}80` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

const STEPS = ['Files', 'Commits', 'Risks', 'People', 'Score'];
const STEP_THRESHOLDS = [20, 45, 65, 80, 95];

export function AnalysisProgress({ progress, currentStep, status, onCancel }: Props) {
  const isFailed = status === 'FAILED';
  const isComplete = status === 'COMPLETED';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="w-full max-w-lg space-y-8">
        <DNAHelix />

        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold">
            {isFailed ? 'Analysis Failed' : isComplete ? 'Analysis Complete' : 'Analyzing Repository'}
          </h2>
          <p className={cn('text-sm font-mono', isFailed ? 'text-red-400' : 'text-muted-foreground')}>
            {currentStep || 'Initializing…'}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-mono">Progress</span>
            <span className={cn('font-mono font-bold tabular-nums', isFailed ? 'text-red-400' : 'text-primary')}>
              {progress}%
            </span>
          </div>

          <Progress
            value={progress}
            className={cn('h-2', isFailed && '[&>div]:bg-red-500')}
          />

          <div className="flex justify-between text-[10px] font-mono">
            {STEPS.map((step, i) => (
              <span key={step} className={cn('text-muted-foreground transition-colors', progress >= STEP_THRESHOLDS[i] && 'text-primary font-medium')}>
                {step}
              </span>
            ))}
          </div>
        </div>

        {!isComplete && onCancel && (
          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="mr-2 h-3.5 w-3.5" />
              {isFailed ? 'Dismiss' : 'Cancel'}
            </Button>
          </div>
        )}

        {!isFailed && (
          <p className="text-center text-xs text-muted-foreground">
            Analysis typically takes 30–90 seconds.
            <br />
            You can safely navigate away — progress is saved.
          </p>
        )}
      </div>
    </div>
  );
}
