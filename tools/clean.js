#!/usr/bin/env node
/** Removes build output and the Parcel cache. */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

for (const target of ['dist', '.parcel-cache']) {
	fs.rmSync(path.join(root, target), { recursive: true, force: true });
	console.log(`removed ${target}`);
}
