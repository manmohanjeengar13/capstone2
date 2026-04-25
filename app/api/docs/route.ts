// app/api/docs/route.ts
import { NextResponse } from 'next/server';

/**
 * GET /api/docs
 * Returns the OpenAPI 3.0 specification for the DNA Analyzer API.
 */
export async function GET(): Promise<NextResponse> {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'DNA Analyzer API',
      version: '1.0.0',
      description: 'Production-grade GitHub repository health analysis API. Analyzes code complexity, commit patterns, risk areas, developer behavior, and generates a comprehensive health score.',
      contact: { name: 'DNA Analyzer', url: 'https://github.com' },
      license: { name: 'MIT' },
    },
    servers: [
      { url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000', description: 'Current environment' },
    ],
    tags: [
      { name: 'Analysis', description: 'Submit and monitor repository analysis jobs' },
      { name: 'Reports', description: 'Retrieve and manage analysis reports' },
      { name: 'GitHub', description: 'GitHub repository search' },
      { name: 'Dashboard', description: 'Aggregated statistics' },
    ],
    components: {
      securitySchemes: {
        sessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'better-auth.session-token',
          description: 'Session cookie set by Better Auth after OAuth login',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'Bearer token from Better Auth session',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            data: { description: 'Response payload or null on error' },
            error: { type: 'string', nullable: true, description: 'Human-readable error message or null on success' },
            meta: { type: 'object', description: 'Optional metadata' },
          },
          required: ['data', 'error'],
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/Report' } },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            hasMore: { type: 'boolean' },
          },
        },
        AnalysisProgress: {
          type: 'object',
          properties: {
            jobId: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'] },
            progress: { type: 'integer', minimum: 0, maximum: 100 },
            currentStep: { type: 'string' },
            reportId: { type: 'string', nullable: true },
            errorMsg: { type: 'string', nullable: true },
          },
          required: ['jobId', 'status', 'progress', 'currentStep'],
        },
        SubScores: {
          type: 'object',
          properties: {
            complexity: { type: 'number', minimum: 0, maximum: 100, description: 'Code complexity score (higher = less complex = better)' },
            commits: { type: 'number', minimum: 0, maximum: 100, description: 'Commit hygiene score' },
            risk: { type: 'number', minimum: 0, maximum: 100, description: 'Risk level (higher = riskier)' },
            velocity: { type: 'number', minimum: 0, maximum: 100, description: 'Development velocity score' },
          },
          required: ['complexity', 'commits', 'risk', 'velocity'],
        },
        RiskArea: {
          type: 'object',
          properties: {
            file: { type: 'string' },
            severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
            reason: { type: 'string' },
            metric: { type: 'string' },
          },
          required: ['file', 'severity', 'reason', 'metric'],
        },
        ContributorInsight: {
          type: 'object',
          properties: {
            login: { type: 'string' },
            avatarUrl: { type: 'string' },
            commitCount: { type: 'integer' },
            linesAdded: { type: 'integer' },
            linesDeleted: { type: 'integer' },
            churnRatio: { type: 'number' },
            lastActiveAt: { type: 'string', format: 'date-time' },
            isGhost: { type: 'boolean' },
            ownershipPercent: { type: 'number' },
          },
        },
        Report: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            jobId: { type: 'string' },
            repoUrl: { type: 'string' },
            repoName: { type: 'string' },
            repoOwner: { type: 'string' },
            healthScore: { type: 'number', minimum: 0, maximum: 100 },
            grade: { type: 'string', enum: ['A', 'B', 'C', 'D', 'F'] },
            subScores: { $ref: '#/components/schemas/SubScores' },
            busFactor: { type: 'integer' },
            topComplexFiles: { type: 'array', items: { type: 'string' } },
            riskAreas: { type: 'array', items: { $ref: '#/components/schemas/RiskArea' } },
            contributorInsights: { type: 'array', items: { $ref: '#/components/schemas/ContributorInsight' } },
            summary: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'jobId', 'repoUrl', 'repoName', 'repoOwner', 'healthScore', 'grade'],
        },
        GithubRepo: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            fullName: { type: 'string' },
            url: { type: 'string' },
            description: { type: 'string', nullable: true },
            language: { type: 'string', nullable: true },
            stars: { type: 'integer' },
            forks: { type: 'integer' },
            isPrivate: { type: 'boolean' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            data: { nullable: true, example: null },
            error: { type: 'string', description: 'Error message' },
          },
        },
      },
    },
    security: [{ sessionCookie: [] }],
    paths: {
      '/api/analyze': {
        post: {
          tags: ['Analysis'],
          summary: 'Submit repository for analysis',
          description: 'Enqueues a new analysis job for the given GitHub repository URL. Rate limited to 5 requests per hour per user.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['repoUrl'],
                  properties: {
                    repoUrl: {
                      type: 'string',
                      format: 'uri',
                      example: 'https://github.com/vercel/next.js',
                      description: 'Full GitHub repository URL',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '202': {
              description: 'Analysis job accepted and queued',
              content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiResponse' }], properties: { data: { type: 'object', properties: { jobId: { type: 'string' }, status: { type: 'string', example: 'PENDING' } } } } } } },
            },
            '400': { description: 'Invalid URL or missing GitHub token', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '401': { description: 'Not authenticated' },
            '429': { description: 'Rate limit exceeded', headers: { 'Retry-After': { schema: { type: 'integer' } }, 'X-RateLimit-Limit': { schema: { type: 'integer' } } } },
          },
        },
      },
      '/api/analyze/{jobId}': {
        get: {
          tags: ['Analysis'],
          summary: 'Poll analysis job progress',
          description: 'Returns current status and progress percentage for an analysis job.',
          parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'string' }, description: 'Analysis job ID' }],
          responses: {
            '200': {
              description: 'Job progress',
              content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiResponse' }], properties: { data: { $ref: '#/components/schemas/AnalysisProgress' } } } } },
            },
            '401': { description: 'Not authenticated' },
            '404': { description: 'Job not found' },
          },
        },
      },
      '/api/reports': {
        get: {
          tags: ['Reports'],
          summary: 'List reports',
          description: 'Returns a paginated list of analysis reports for the authenticated user.',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 50 } },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['createdAt_desc', 'createdAt_asc', 'healthScore_desc', 'healthScore_asc'], default: 'createdAt_desc' } },
          ],
          responses: {
            '200': { description: 'Paginated reports', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } },
            '401': { description: 'Not authenticated' },
          },
        },
      },
      '/api/reports/{id}': {
        get: {
          tags: ['Reports'],
          summary: 'Get single report',
          description: 'Returns a full report including raw analysis data. Redis-cached for 1 hour.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'Full report with rawData', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiResponse' }], properties: { data: { $ref: '#/components/schemas/Report' } } } } } },
            '401': { description: 'Not authenticated' },
            '404': { description: 'Report not found' },
          },
        },
        delete: {
          tags: ['Reports'],
          summary: 'Delete report',
          description: 'Soft-deletes a report (sets deletedAt timestamp). Invalidates Redis cache.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'Report deleted' },
            '401': { description: 'Not authenticated' },
            '404': { description: 'Report not found' },
          },
        },
      },
      '/api/github/search': {
        get: {
          tags: ['GitHub'],
          summary: 'Search GitHub repositories',
          description: 'Typeahead search for GitHub repositories. Returns up to 10 matching repos.',
          parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2 }, description: 'Search query' }],
          responses: {
            '200': { description: 'List of matching repositories', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ApiResponse' }], properties: { data: { type: 'array', items: { $ref: '#/components/schemas/GithubRepo' } } } } } } },
            '401': { description: 'Not authenticated' },
          },
        },
      },
      '/api/dashboard': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get dashboard stats',
          description: 'Returns aggregated statistics including total reports, average health score, and 6 most recent reports.',
          responses: {
            '200': { description: 'Dashboard statistics' },
            '401': { description: 'Not authenticated' },
          },
        },
      },
    },
  };

  return NextResponse.json(spec, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
