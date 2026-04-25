// components/analyze/AnalysisForm.tsx
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dna, Loader2, Lightbulb } from 'lucide-react';
import { RepoSearchInput } from './RepoSearchInput';
import { repoUrlSchema, type RepoUrlInput } from '@/validations/analyze.schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface Props {
  onSubmit: (repoUrl: string) => Promise<void>;
  isLoading?: boolean;
}

const POPULAR_REPOS = [
  { label: 'facebook/react', url: 'https://github.com/facebook/react' },
  { label: 'vercel/next.js', url: 'https://github.com/vercel/next.js' },
  { label: 'microsoft/vscode', url: 'https://github.com/microsoft/vscode' },
  { label: 'tailwindlabs/tailwindcss', url: 'https://github.com/tailwindlabs/tailwindcss' },
  { label: 'prisma/prisma', url: 'https://github.com/prisma/prisma' },
  { label: 'vitejs/vite', url: 'https://github.com/vitejs/vite' },
];

export function AnalysisForm({ onSubmit, isLoading }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<RepoUrlInput>({
    resolver: zodResolver(repoUrlSchema),
    defaultValues: { repoUrl: '' },
  });

  const handleFormSubmit = async (data: RepoUrlInput) => {
    setIsSubmitting(true);
    try { await onSubmit(data.repoUrl); } finally { setIsSubmitting(false); }
  };

  const busy = isLoading || isSubmitting;

  return (
    <div className="w-full max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <Dna className="h-7 w-7 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Analyze a Repository</h1>
        <p className="text-sm text-muted-foreground">Enter a GitHub URL or search by name</p>
      </div>

      {/* Form card */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repoUrl">Repository URL</Label>
              <Controller
                name="repoUrl"
                control={control}
                render={({ field }) => (
                  <RepoSearchInput
                    value={field.value}
                    onChange={field.onChange}
                    onSelect={(repo) => setValue('repoUrl', repo.url)}
                    error={errors.repoUrl?.message}
                    disabled={busy}
                  />
                )}
              />
            </div>

            <Button type="submit" disabled={busy} className="w-full" size="lg">
              {busy ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Starting analysis…</>
              ) : (
                <><Dna className="mr-2 h-4 w-4" />🧬 Analyze Repository</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick-select */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Try a popular repo</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_REPOS.map(({ label, url }) => (
            <Button
              key={url}
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => setValue('repoUrl', url)}
              className="font-mono text-xs h-7"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
            Tips for best results
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <ul className="space-y-1 text-xs text-muted-foreground">
            {[
              'Sign in with GitHub to analyze private repositories',
              'Repos with 50+ commits produce the most accurate analysis',
              'Analysis takes 30–90 seconds depending on repository size',
              'Rate limited to 5 analyses per hour',
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">·</span> {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
