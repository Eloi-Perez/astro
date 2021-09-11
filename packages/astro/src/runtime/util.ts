import fs from 'fs';
import path from 'path';

/** Normalize URL to its canonical form */
export function canonicalURL(url: string, base?: string): URL {
  let pathname = url.replace(/\/index.html$/, ''); // index.html is not canonical
  pathname = pathname.replace(/\/1\/?$/, ''); // neither is a trailing /1/ (impl. detail of collections)
  if (!path.extname(pathname)) pathname = pathname.replace(/(\/+)?$/, '/'); // add trailing slash if there’s no extension
  pathname = pathname.replace(/\/+/g, '/'); // remove duplicate slashes (URL() won’t)
  return new URL(pathname, base);
}

/** get user dependency list for Vite */
export async function getPackageJSON(projectRoot: URL): Promise<Record<string, any> | undefined> {
  const possibleLocs = new Set(['./package.json']);
  for (const possibleLoc of possibleLocs) {
    const packageJSONLoc = new URL(possibleLoc, projectRoot);
    if (fs.existsSync(packageJSONLoc)) {
      return JSON.parse(await fs.promises.readFile(packageJSONLoc, 'utf8'));
    }
  }
}

/** is a specifier an npm package? */
export function parseNpmName(spec: string): { scope?: string; name: string; subpath?: string } | undefined {
  // not an npm package
  if (!spec || spec[0] === '.' || spec[0] === '/') return undefined;

  let scope: string | undefined;
  let name = '';

  let parts = spec.split('/');
  if (parts[0][0] === '@') {
    scope = parts[0];
    name = parts.shift() + '/';
  }
  name += parts.shift();

  let subpath = parts.length ? `./${parts.join('/')}` : undefined;

  return {
    scope,
    name,
    subpath,
  };
}