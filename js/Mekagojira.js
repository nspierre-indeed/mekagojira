
import {
    MekaBoards,
    MekaLoader,
    MekaMiniLoader,
    MekaNav,
    MekaOption,
    MekaOptionFilters,
    MekaOptions,
    MekaTasks,
    MekaPopup,
    MekaError,
    MekaVisualizerSprints,
    MekaVisualizerVariants,
    MekaVisualizer
} from './components/index.js';

window.customElements.define('meka-loader', MekaLoader);
window.customElements.define('meka-mini-loader', MekaMiniLoader);
window.customElements.define('meka-nav', MekaNav);
window.customElements.define('meka-tasks', MekaTasks);
window.customElements.define('meka-popup', MekaPopup);
window.customElements.define('meka-option', MekaOption);
window.customElements.define('meka-option-filters', MekaOptionFilters);
window.customElements.define('meka-options', MekaOptions);
window.customElements.define('meka-boards', MekaBoards);
window.customElements.define('meka-error', MekaError);
window.customElements.define('meka-visualizer-sprints', MekaVisualizerSprints);
window.customElements.define('meka-visualizer-variants', MekaVisualizerVariants);
window.customElements.define('meka-visualizer', MekaVisualizer);