import type { GithubTree } from '@/types/github';
import { clamp } from '@/lib/utils';

export interface ComplexityResult { complexityScore: number; topComplexFiles: string[]; totalFiles: number; largeFileCount: number; deepDirCount: number; languageCount: number; }
const CODE_EXT = new Set(['.ts','.tsx','.js','.jsx','.mjs','.py','.java','.go','.rs','.cpp','.c','.cs','.php','.rb','.swift','.kt','.scala','.vue','.svelte','.dart']);

export function analyzeComplexity(tree: GithubTree, languages: Record<string, number>): ComplexityResult {
  const blobs = tree.tree.filter(e => e.type === 'blob');
  const dirs = tree.tree.filter(e => e.type === 'tree');
  const totalFiles = blobs.length;
  const largeFiles = blobs.filter(e => (e.size ?? 0) > 25000);
  const deepDirs = dirs.filter(e => e.path.split('/').length > 5);
  const topComplexFiles = blobs.filter(e => CODE_EXT.has(getExt(e.path))).sort((a,b) => (b.size??0)-(a.size??0)).slice(0,10).map(e => e.path);
  const languageCount = Object.keys(languages).length;
  const penalty = Math.min(largeFiles.length*5,40) + Math.min(deepDirs.length*3,20) + (languageCount>5?10:0) + (totalFiles>5000?10:totalFiles>1000?5:0);
  return { complexityScore: clamp(100-penalty,0,100), topComplexFiles, totalFiles, largeFileCount: largeFiles.length, deepDirCount: deepDirs.length, languageCount };
}
function getExt(p: string): string { const i=p.lastIndexOf('.'); return i===-1?'':p.slice(i).toLowerCase(); }
