/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type { GraphData } from 'force-graph';

import type { ISignal } from '@lumino/signaling';

import type { DOMWidgetView } from '@jupyter-widgets/base';

import PKG from '../package.json';

export const NAME = PKG.name;
export const VERSION = PKG.version;
export const EMOJI = '🕸️';
export const DEBUG = window.location.href.includes('FORCEGRAPH_DEBUG');

export const CSS = {
  widget: 'jp-ForceGraph',
};

export const EMPTY_GRAPH_DATA: GraphData = Object.freeze({
  links: [],
  nodes: [],
});

export const DEFAULT_COLUMNS = {
  id: 'id',
  source: 'source',
  target: 'target',
};

export const DEFAULT_COLORS = {
  selected: '#B3A369',
  notSelected: '#003057',
};

export const WIDGET_DEFAULTS = {
  _model_module: NAME,
  _model_module_version: VERSION,
  _view_module: NAME,
  _view_module_version: VERSION,
};

export interface IBehave {
  onUpdate(graph: IHasGraph): any;
  updateRequested: ISignal<IBehave, void>;
}

export interface IHasGraph<T = any> extends DOMWidgetView {
  graph: T;
  source: ISource;
  rendered: Promise<void>;
}

export interface ISource {
  graphData: GraphData;
}
