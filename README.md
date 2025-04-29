# Mekagojira Sprint View for Chrome #

![MekaGojira](/img/repo.jpg)

Proudly crafted in small batches using pure VanillaJS (not extract).

## How to use

1. Clone this repo
2. Click the chrome options item, then go to more tools -> extensions.
3. Activate 'developer mode' on the top right.
4. Click 'load unpacked' and navigate to the root directory of this repo.
5. You'll need to configure the URL to your jira instance, and make some other basic choices. This options menu should pop up on its own. If it does not, pick "configure" from the extension popup, or right-click the icon and click "options."
6. OBSERVE THE MAGIC

## How to dev

See steps 1-5 above (ESPECIALLY the one about magic).

All the source code lives in `./src` and is not compiled or pre-processed. 

### Arch overview

#### Root files
 * [board_view.html](./board_view.html) -- main view for visualizing a given sprint board
 * [manifest.json](./manifest.json) -- manifest required by chrome to load the extension
 * [options.html](./options.html) -- view file for options/settings page
 * [package.json](./package.json) -- standard node package.json
 * [popup.html](./popup.html) -- view for the popup when you click the icon

#### Subfolders
 * [fonts](./fonts) -- contains web fonts for display
 * [img](./img) -- contains images for display
 * [js](./js)
   * [components](./js/components) -- generic components needed for a variety of things (see index for module exports)
     * [popup](./js/components/popup) -- contains components visible on popup view
     * [settings](./js/components/settings) -- contains components visible on options/settings page
     * [visualizer](./js/components/visualizer) -- contains components visible on the board view page
   * [Mekagojira.js](./js/Mekagojira.js) -- base JS file for importing and defining web components
   * [background.js](./js/background.js) -- service/web worker that runs in chrome background to handle polling updates
   * [utils.js](./js/utils.js) -- generic utils used everywhere else

### Okay but what is all this?
This is an architecture based on the chrome implementation of web components. The base component is `src/MekaPonent.js`. Note that it `extends` from `HTMLComponent`, and makes use of the shadow DOM to render its view. In order to make the es6 imports work across source files, we have to make sure to include the various javascript files as `type="module"` whenever the script tag is used to invoke them. 

### Why?
Well, the main goal was to make something that did not require any understanding of a specific framework, and be as agnostic and unopinionated about how to build something equivalent to a reactive MVC pattern. Because I built it as a Chrome extension, we can utilize the chrome versions of things directly and not worry about compatability. Also, because it's only served locally, we're not worried about minifying or obfuscating any of the code, so it makes sense to use something that approaches basic javascript functionality (with some helper functions built in to the base classes)
