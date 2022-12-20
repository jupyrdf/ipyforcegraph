import type { GraphData } from 'force-graph';

import PKG from '../package.json';

export const NAME = PKG.name;
export const VERSION = PKG.version;
export const EMOJI = '🕸️';
export const DEBUG = window.location.href.includes('FORCEGRAPH_DEBUG');

export const EMPTY_GRAPH_DATA: GraphData = Object.freeze({
  links: [],
  nodes: [],
});

export const WIDGET_DEFAULTS = {
  _model_module: NAME,
  _model_module_version: VERSION,
  _view_module: NAME,
  _view_module_version: VERSION,
};
