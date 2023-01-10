/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type { GraphData, LinkObject, NodeObject } from 'force-graph';

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
  selected: '#b3a369',
  node: '#1f78b3',
  link: 'rgba(66,66,66,0.5)',
};

export const WIDGET_DEFAULTS = {
  _model_module: NAME,
  _model_module_version: VERSION,
  _view_module: NAME,
  _view_module_version: VERSION,
};

export interface IBehave {
  updateRequested: ISignal<IBehave, void>;
  getLinkColor?(options: ILinkBehaveOptions): string | null;
  getLinkLabel?(options: ILinkBehaveOptions): string | null;
  getNodeColor?(options: INodeBehaveOptions): string | null;
  getNodeLabel?(options: INodeBehaveOptions): string | null;
  // evented
  onNodeClick?(options: INodeEventBehaveOptions): boolean;
}

export type TNodeBehaveMethod = 'getNodeLabel' | 'getNodeColor';
export type TLinkBehaveMethod = 'getLinkLabel' | 'getLinkColor';

export interface IBehaveOptions {
  view: IHasGraph;
  graphData: GraphData;
}

export interface INodeBehaveOptions extends IBehaveOptions {
  node: NodeObject;
}
export interface INodeEventBehaveOptions extends INodeBehaveOptions {
  event: MouseEvent;
}

export interface ILinkBehaveOptions extends IBehaveOptions {
  link: LinkObject;
}

export interface IHasGraph<T = any> extends DOMWidgetView {
  graph: T;
  source: ISource;
  rendered: Promise<void>;
  wrapFunction: (fn: Function) => Function;
}

export interface ISource {
  graphData: GraphData;
}
