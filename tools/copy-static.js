#!/usr/bin/env node
/**
 * Copies the runtime assets that Parcel does not bundle into the dist directory.
 *
 * The robot models, xacro files and localization snippets are fetched over HTTP
 * at runtime (see simulator/scene.js and index.js), so they have to sit next to
 * index.html as plain files rather than being pulled into a bundle.
 *
 * Usage: node tools/copy-static.js <dist-dir>
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const distDir = path.resolve(root, process.argv[2] || 'dist/build');

// Source material that lives under assets/ but has no business being deployed:
// video project files and the raw artwork/archives used to produce the assets.
const EXCLUDED = [
	path.join(root, 'assets', 'src'),
];

function isExcluded(src) {
	if (path.extname(src).toLowerCase() === '.vproj') {
		return true;
	}
	return EXCLUDED.some((ex) => src === ex || src.startsWith(ex + path.sep));
}

function copy(src, dest, filter) {
	const from = path.resolve(root, src);
	if (!fs.existsSync(from)) {
		console.warn(`  skipped ${src} (not found)`);
		return;
	}
	fs.cpSync(from, path.resolve(distDir, dest), {
		recursive: true,
		filter: filter || (() => true),
	});
	console.log(`  ${src} -> ${path.relative(root, path.resolve(distDir, dest))}`);
}

fs.mkdirSync(distDir, { recursive: true });

console.log(`Copying static files into ${path.relative(root, distDir)}`);

// assets/ is flattened into the dist root, so models/ ends up at <public-url>/models/
// which is what MODELS_ROOT in simulator/robots/robotbase.js expects.
copy('assets', '.', (src) => !isExcluded(src));
copy('i18n', 'i18n');

for (const file of ['LICENSE', 'NOTICE', 'README.md']) {
	copy(file, file);
}

// Stops GitHub Pages from running the output through Jekyll, which would drop
// any file or directory whose name begins with an underscore.
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
console.log('  wrote .nojekyll');
