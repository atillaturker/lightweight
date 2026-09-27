/**
 * Architecture rules from AGENTS.md, enforced by reading import statements
 * (the project has no ESLint).
 *
 * - A feature may import another feature only through its public barrel
 *   (`@features/<name>`), never a path inside it.
 * - Feature dependencies must not form a cycle.
 * - A feature may import from `src/app` only the navigation param lists,
 *   and only as `import type`.
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { dirname, join, relative, resolve, sep } from 'path';

const SRC = resolve(__dirname, '..');
const FEATURES = join(SRC, 'features');

/** One import statement found in a source file. */
interface ImportRef {
  file: string;
  specifier: string;
  typeOnly: boolean;
}

/** Every non-test .ts/.tsx file under `dir`. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      return entry === '__tests__' ? [] : sourceFiles(path);
    }
    return /\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [path] : [];
  });
}

/** Import and re-export statements of one file. */
function importsOf(file: string): ImportRef[] {
  const source = readFileSync(file, 'utf8');
  const pattern = /(?:^|\n)\s*(import|export)\s+(type\s+)?[^'";]*?from\s+['"]([^'"]+)['"]/g;
  return Array.from(source.matchAll(pattern), (match) => ({
    file,
    specifier: match[3],
    typeOnly: match[2] !== undefined,
  }));
}

/** The feature a file belongs to. */
function featureOf(file: string): string {
  return relative(FEATURES, file).split(sep)[0];
}

/** The feature a specifier points into, or `null` when it is not one. */
function targetFeature(ref: ImportRef): { name: string; deep: boolean } | null {
  const alias = /^@\/?features\/([^/]+)(\/.*)?$/.exec(ref.specifier);
  if (alias) return { name: alias[1], deep: alias[2] !== undefined };
  if (!ref.specifier.startsWith('.')) return null;
  const target = resolve(dirname(ref.file), ref.specifier);
  if (!target.startsWith(FEATURES + sep)) return null;
  return { name: featureOf(target), deep: true };
}

const featureImports = sourceFiles(FEATURES).flatMap(importsOf);

/** Human-readable location of an import for failure messages. */
function location(ref: ImportRef): string {
  return `${relative(SRC, ref.file)} -> ${ref.specifier}`;
}

/** Feature dependency graph built from cross-feature imports. */
function featureGraph(): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();
  for (const ref of featureImports) {
    const target = targetFeature(ref);
    const owner = featureOf(ref.file);
    if (target === null || target.name === owner || ref.typeOnly) continue;
    const edges = graph.get(owner) ?? new Set<string>();
    edges.add(target.name);
    graph.set(owner, edges);
  }
  return graph;
}

/** One cycle in `graph` as a path of feature names, or `null`. */
function findCycle(graph: Map<string, Set<string>>): string[] | null {
  const done = new Set<string>();
  const visit = (node: string, path: string[]): string[] | null => {
    if (path.includes(node)) return [...path.slice(path.indexOf(node)), node];
    if (done.has(node)) return null;
    for (const next of graph.get(node) ?? []) {
      const cycle = visit(next, [...path, node]);
      if (cycle) return cycle;
    }
    done.add(node);
    return null;
  };
  for (const node of graph.keys()) {
    const cycle = visit(node, []);
    if (cycle) return cycle;
  }
  return null;
}

describe('feature boundaries', () => {
  it('finds the feature source files', () => {
    expect(featureImports.length).toBeGreaterThan(100);
  });

  it('imports other features only through their barrel', () => {
    const violations = featureImports
      .filter((ref) => {
        const target = targetFeature(ref);
        return target !== null && target.name !== featureOf(ref.file) && target.deep;
      })
      .map(location);
    expect(violations).toEqual([]);
  });

  it('has no cycles between features', () => {
    expect(findCycle(featureGraph())).toBeNull();
  });

  it('imports from src/app only navigation types, as import type', () => {
    const violations = featureImports
      .filter((ref) => /^@\/app(\/|$)/.test(ref.specifier))
      .filter((ref) => !(ref.typeOnly && ref.specifier === '@/app/navigation/types'))
      .map(location);
    expect(violations).toEqual([]);
  });
});
