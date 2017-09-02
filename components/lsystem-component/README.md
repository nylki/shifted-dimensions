# README external libraries

I wanted to use my [Lindenmayer component](https://github.com/nylki/aframe-lsystem-component) for this js13k entry, which I could have included via `npm install aframe-lsystem-component` as a dependency and import it.

However due to some size optimizations I decided to include a modified version directly into this repo.
The published `aframe-lsystem-component` is bundled with webpack and uses a plugin to inline and bundle *webworker*'s. Unfortunately Webpack's bundle size becomes prohibitively large for js13k at the time of writing with the current config.
Unfortunately I can't use rollup (which creates much smaller bundles) for the library either because there is no good alternative for the webpack webworker plugin there.
Therefore to reduce size I am ditching the webworker support for this js13k entry, which makes it possible to use rollup and also removing some code I am not using anyways. The omission of the webworker usage makes it a bit slower when generating LSystem-output though.

You can still compile the game with the official, and not-optimized-for-size library via `npm install` but that results in a game >13k ;)
