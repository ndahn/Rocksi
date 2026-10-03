# Rocksi
Rocksi is the R**obot** Bl**ock**s **Si**mulator. Acronyms are strange :)

Rocksi is a robot simulator that runs entirely in (modern) web browsers with absolutely no installation. It is thus platform independent and won't care if students are working on Android tablets, iPads or laptops. The robot is programmed using the popular [Blockly](https://developers.google.com/blockly/ library, which is also used by Scratch, Niryo, and a bunch of other projects, and a custom execution routine. 

A running version can be found on **[ndahn.github.io/](https://ndahn.github.io/)** and the source code is available at **[github.com/ndahn/Rocksi](https://github.com/ndahn/Rocksi)**! Unfortunately, the version at rocksi.net is outdated and I have no control over the URL anymore.


## License
Rocksi is distributed under the very permissive MIT license, which basically states that you can do with it whatever you want! Check out the LICENSE file for further details. However, please be aware that some of the robot models included may use different licenses. The relevant companies have permitted the use in Rocksi.


## Building
You will need [Node.js](https://nodejs.org/) 18 or newer and npm. First install the dependencies by running the following command in the project's root directory:
```
npm install
```

To work on Rocksi, start the Parcel development server:
```
npm run dev
```
This serves Rocksi at http://localhost:1234 with hot reloading.

To produce a deployable site, use one of the build scripts:

| Script | Serves from | Output |
| --- | --- | --- |
| `npm run build` | domain root | `dist/build/` |
| `npm run build:gh-pages` | `/Rocksi/` | `dist/build/` |
| `npm run build:moodle` | `/rocksi/` | `dist/build/` |

The builds differ only in the public URL the assets are referenced under, so
pick the one matching where the site will be hosted. `npm run clean` removes
`dist/` and the Parcel cache.

Note that the robot models, localization snippets and tutorial videos are
fetched over HTTP at runtime rather than bundled, so every build runs
`tools/copy-static.js` to place them next to `index.html`.


## Deploying
`npm run deploy` publishes the site to the `gh-pages` branch, which GitHub Pages
serves at https://ndahn.github.io/Rocksi/:
```
npm run deploy
```
The `predeploy` script cleans and rebuilds first, so this is the only command
you need. Pass `--dry-run` to build the commit without pushing it:
```
node tools/deploy.js --dry-run
```
The deploy works inside a temporary git worktree and never modifies your local
branches or working tree.

Pushing to `master` also deploys automatically via
`.github/workflows/deploy.yml`, so manual deploys are only needed to publish
without committing to `master`.


## Navigating the code
You can find the main entry point in `src/index.js`. From there, anything related to the 3d-side (e.g. viewport, robot model, inverse kinematics, etc.) can be found in `src/simulation/`, and the entrypoint for that directory is `scene.js`. 

If you are interested in the robot's programming side, you should have a look at `src/editor/blockly.js`. The custom commands for the robot can be found in `src/editor/blocks/` and the functions for turning them into runnable code in `src/editor/generators/`. 

Finally, if you want to see how the robot executes the commands it receives, you should look at `src/simulation/simulator.js`. 

Feel free to drop me a message if you need further help! :)


## Motivation
Robots are one of the corner stones of future industries and technological development. The recent years' advancements in control, intuivity and sensitivity has made these beautiful yet complex machines much more accessible. Modern robots manage to hide much of their complexity, to the degree that even non-specialists and children can handle them with ease. 

Despite these major advancements, to the average person robots stay elusive and incomrpehensible, almost mystical. This is for two reasons:
* they are expensive and hard to come by
* the knowledge and tech that makes them move is non-trivial and inaccessible

To this end many schools throughout the world have started adding robotics to their curricula. However, their expensive nature gave rise to a new problem: at classes of 20-40 students, how can every student work with the robot if the school can't afford to spend hundreds of thousands of euros? This is where Rocksi comes in!


## Further Reading
If you speak German and want to learn more about robotics, I want to highlight the free **Roboterführerschein** (robots driving license) on [robotikschulungen.de](https://robotikschulungen.de), which I co-developed. Hint: the Niryo courses are by me as well :)
