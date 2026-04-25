// app/api-docs/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Dna } from 'lucide-react';
import Link from 'next/link';

export default function ApiDocsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Dynamically load swagger-ui-react to avoid SSR issues
    const loadSwagger = async () => {
      const { default: SwaggerUI } = await import('swagger-ui-react');
      await import('swagger-ui-react/swagger-ui.css');

      const container = document.getElementById('swagger-container');
      if (!container) return;

      // Use React to render SwaggerUI — since we're in useEffect, safe to do DOM injection
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(container);
      root.render(
        SwaggerUI({
          url: '/api/docs',
          docExpansion: 'list',
          defaultModelsExpandDepth: 2,
          persistAuthorization: true,
          displayRequestDuration: true,
          filter: true,
          tryItOutEnabled: true,
        })
      );
    };

    loadSwagger().catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0B10]">
      {/* Header */}
      <div className="border-b border-[hsl(215_20%_16%)] bg-[hsl(224_15%_9%)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Dna className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <span className="font-bold text-sm text-white">DNA Analyzer</span>
              <span className="ml-2 text-xs text-gray-400">API Documentation</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              Raw OpenAPI JSON
            </a>
            <Link
              href="/dashboard"
              className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              Go to App
            </Link>
          </div>
        </div>
      </div>

      {/* Swagger UI container */}
      {mounted && (
        <div id="swagger-container" className="swagger-wrapper" />
      )}

      {/* Custom overrides to make swagger-ui dark-friendly */}
      <style>{`
        .swagger-wrapper .swagger-ui {
          font-family: var(--font-geist-sans, 'Inter', sans-serif) !important;
        }
        .swagger-wrapper .swagger-ui .topbar { display: none; }
        .swagger-wrapper .swagger-ui .info { padding: 20px 0; }
        .swagger-wrapper .swagger-ui .info .title { color: #e2e8f0; }
        .swagger-wrapper .swagger-ui .info p { color: #94a3b8; }
        .swagger-wrapper .swagger-ui .scheme-container { background: #0f1117; box-shadow: none; border-bottom: 1px solid #1e2535; }
        .swagger-wrapper .swagger-ui select { background: #1a1e2e; color: #e2e8f0; border: 1px solid #2d3748; }
        .swagger-wrapper .swagger-ui .opblock-tag { color: #e2e8f0; border-bottom: 1px solid #1e2535; }
        .swagger-wrapper .swagger-ui .opblock .opblock-summary-operation-id, 
        .swagger-wrapper .swagger-ui .opblock .opblock-summary-path { color: #e2e8f0; }
        .swagger-wrapper .swagger-ui .opblock-description-wrapper p { color: #94a3b8; }
        .swagger-wrapper .swagger-ui .response-col_status { color: #e2e8f0; }
      `}</style>
    </div>
  );
}
