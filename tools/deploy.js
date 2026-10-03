#!/usr/bin/env node
/**
 * Publishes a built site directory to the gh-pages branch.
 *
 * Works entirely inside a throwaway detached worktree: no local branch is
 * created or moved, and the checkout you are working in is never touched.
 * Deliberately has no npm dependencies -- the usual helper packages drag in a
 * pile of transitive advisories for what amounts to a dozen git commands.
 *
 * Usage: node tools/deploy.js [--dist dist/build] [--branch gh-pages]
 *                             [--remote origin] [--message "..."] [--dry-run]
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');

function parseArgs(argv) {
	const opts = {
		dist: 'dist/build',
		branch: 'gh-pages',
		remote: 'origin',
		message: null,
		'dry-run': false,
	};
	for (let i = 0; i < argv.length; i++) {
		const key = argv[i].replace(/^--/, '');
		if (!(key in opts)) {
			throw new Error(`Unknown option: ${argv[i]}`);
		}
		if (typeof opts[key] === 'boolean') {
			opts[key] = true;
		} else {
			opts[key] = argv[++i];
		}
	}
	return opts;
}

/** Runs git in `cwd`, returning trimmed stdout. Throws on a non-zero exit. */
function git(args, cwd = root) {
	return execFileSync('git', args, {
		cwd,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
	}).trim();
}

/** Runs git but tolerates failure, returning success as a boolean. */
function gitQuiet(args, cwd = root) {
	return spawnSync('git', args, { cwd, stdio: 'ignore' }).status === 0;
}

/**
 * Builds the commit in a detached worktree and pushes it.
 * Returns a human-readable summary; never calls process.exit, so the caller's
 * cleanup always runs.
 */
function publish(opts, distDir, worktree) {
	const sourceCommit = git(['rev-parse', '--short', 'HEAD']);
	const message = opts.message || `Deploy ${sourceCommit}`;

	// Start from the published tip so we extend its history rather than
	// forking from a stale local copy. Detached, so no local branch moves.
	if (gitQuiet(['fetch', opts.remote, opts.branch])) {
		git(['worktree', 'add', '--detach', worktree, `${opts.remote}/${opts.branch}`]);
	} else {
		console.log(`${opts.remote}/${opts.branch} not found, starting a fresh history.`);
		git(['worktree', 'add', '--detach', worktree]);
		// An orphan checkout needs a branch name, so use a throwaway one and
		// push it under the real name below.
		git(['checkout', '--orphan', '_deploy_tmp'], worktree);
	}

	// Clear the branch contents so files deleted since the last deploy actually
	// disappear, then lay the fresh build down on top.
	git(['rm', '-rq', '--ignore-unmatch', '.'], worktree);
	for (const entry of fs.readdirSync(worktree)) {
		if (entry !== '.git') {
			fs.rmSync(path.join(worktree, entry), { recursive: true, force: true });
		}
	}

	fs.cpSync(distDir, worktree, { recursive: true });
	git(['add', '-A'], worktree);

	if (gitQuiet(['diff', '--cached', '--quiet'], worktree)) {
		return 'Build output is identical to the published site, nothing to do.';
	}

	// A detached worktree has no user identity of its own; fall back to one so
	// the commit succeeds on a bare CI checkout.
	const identity = [];
	if (!gitQuiet(['config', 'user.email'])) {
		identity.push('-c', 'user.email=deploy@localhost', '-c', 'user.name=Rocksi Deploy');
	}
	git([...identity, 'commit', '-q', '-m', message], worktree);
	const commit = git(['rev-parse', '--short', 'HEAD'], worktree);

	if (opts['dry-run']) {
		return `Dry run: built ${commit} for ${opts.branch} but did not push.`;
	}

	console.log(`Pushing ${opts.branch} (${commit}) to ${opts.remote}...`);
	git(['push', opts.remote, `HEAD:refs/heads/${opts.branch}`], worktree);
	return `Deployed ${sourceCommit} to ${opts.remote}/${opts.branch} as ${commit}.`;
}

function main() {
	let opts;
	try {
		opts = parseArgs(process.argv.slice(2));
	} catch (err) {
		console.error(`${err.message}\nUsage: node tools/deploy.js [--dist <dir>] [--branch <name>] [--remote <name>] [--message <msg>] [--dry-run]`);
		return 2;
	}

	const distDir = path.resolve(root, opts.dist);
	const rel = path.relative(root, distDir);

	if (!fs.existsSync(path.join(distDir, 'index.html'))) {
		console.error(`No index.html in ${rel} -- run the build first.`);
		return 1;
	}
	if (!fs.existsSync(path.join(distDir, 'models'))) {
		console.error(
			`No models/ in ${rel} -- the static copy step did not run, and the ` +
				`simulator would have no robots to load.`
		);
		return 1;
	}

	// mkdtemp creates the directory, but `git worktree add` insists on making it.
	const worktree = fs.mkdtempSync(path.join(os.tmpdir(), 'rocksi-deploy-'));
	fs.rmSync(worktree, { recursive: true, force: true });

	try {
		console.log(publish(opts, distDir, worktree));
		return 0;
	} catch (err) {
		// execFileSync puts the useful part on stderr, which err.message omits.
		const detail = err.stderr ? String(err.stderr).trim() : err.message;
		console.error(`Deploy failed: ${detail}`);
		return 1;
	} finally {
		gitQuiet(['worktree', 'remove', '--force', worktree]);
		gitQuiet(['worktree', 'prune']);
		gitQuiet(['branch', '-D', '_deploy_tmp']);
		fs.rmSync(worktree, { recursive: true, force: true });
	}
}

process.exitCode = main();
