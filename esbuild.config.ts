import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import * as builtinModules from 'module';

const distDir = 'dist';
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy and simplify package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const deployPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  engines: packageJson.engines,
  main: 'bundle.js',
  dependencies: packageJson.dependencies,
};

fs.writeFileSync(
  path.join(distDir, 'package.json'),
  JSON.stringify(deployPackageJson, null, 2)
);

// Get built-in modules using the 'module' built-in
const builtins = builtinModules.builtinModules;

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: path.join(distDir, 'bundle.js'),
    platform: 'node',
    target: 'node20',
    sourcemap: true,
    format: 'cjs',
    minify: true,
    treeShaking: true,
    external: [
      // Node.js built-in modules
      ...builtins,
      // Dependencies from package.json
      ...Object.keys(packageJson.dependencies || {}),
      // Dev dependencies from package.json
      ...Object.keys(packageJson.devDependencies || {}),
    ],
    logLevel: 'info',
    metafile: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    drop: ['debugger', 'console'],
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  })
  .then(async (result) => {
    if (result.metafile) {
      fs.writeFileSync(
        path.join(distDir, 'bundle-analysis.json'),
        JSON.stringify(result.metafile, null, 2)
      );

      const stats = await esbuild.analyzeMetafile(result.metafile);
      console.log('Bundle size analysis:\n' + stats);
    }
  })
  .catch(() => process.exit(1));
