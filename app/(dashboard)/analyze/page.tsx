'use client';
import { AnalysisForm } from '@/components/analyze/AnalysisForm';
import { AnalysisProgress } from '@/components/analyze/AnalysisProgress';
import { useAnalysis } from '@/hooks/useAnalysis';

export default function AnalyzePage() {
  const { status, progress, currentStep, isActive, submitRepo, cancelAnalysis } = useAnalysis();
  if (isActive || status === 'FAILED') {
    return <AnalysisProgress progress={progress} currentStep={currentStep} status={status??'PENDING'} onCancel={cancelAnalysis}/>;
  }
  return <div className="flex items-start justify-center min-h-[70vh] pt-8"><AnalysisForm onSubmit={submitRepo}/></div>;
}
