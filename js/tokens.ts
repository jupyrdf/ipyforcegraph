/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type d3Force3d from 'd3-force-3d';
import type { GraphData, LinkObject, NodeObject } from 'force-graph';
import type THREE from 'three';

import type { ISignal } from '@lumino/signaling';

import type { DOMWidgetView, WidgetModel } from '@jupyter-widgets/base';

import PKG from '../package.json';

import type { ForceGraphModel } from './widgets';

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

export const DEFAULT_BEHAVIOR_RANK = 100;

export const DEFAULT_COLORS = {
  selected: 'rgba(179, 163, 105, 1.0)',
  node: 'rgba(31, 120, 179, 1.0)',
  link: 'rgba(66, 66, 66, 0.5)',
  background: 'rgba(0, 0, 0, 0.0)',
};

export const DEFAULT_WIDTHS = {
  link: 1,
  selected: 2,
  node: 1,
};

export const DEFAULT_CURVATURES = {
  link: 0,
  selected: null,
};

export const DEFAULT_LINE_DASHES = {
  link: [],
  selected: null,
};

export const WIDGET_DEFAULTS = {
  _model_module: NAME,
  _model_module_version: VERSION,
  _view_module: NAME,
  _view_module_version: VERSION,
};

//  Using bit flags for the TUpdateKind number
export enum EUpdate {
  Unknown = 0,
  Reheat = 1 << 0,
  Cosmetic = 1 << 1,
  Render = 1 << 2,
  Behavior = 1 << 3,
}
export type TUpdateKind = void | number;

export interface IBehave extends WidgetModel {
  rank: number;
  updateRequested: ISignal<IBehave, TUpdateKind>;
  graphDataUpdateRequested: ISignal<IBehave, void>;
  extraColumns?: IExtraColumns;
  updateGraphData?(graphData: GraphData): Promise<void>;
  // link
  getLinkColor?(options: ILinkBehaveOptions): string | null;
  getLinkCurvature?(options: ILinkBehaveOptions): number | null;
  getLinkLineDash?(options: ILinkBehaveOptions): number[] | null;
  getLinkWidth?(options: ILinkBehaveOptions): number | null;
  getLinkLabel?(options: ILinkBehaveOptions): string | null;
  getLinkDirectionalArrowColor?(options: ILinkBehaveOptions): string | null;
  getLinkDirectionalArrowLength?(options: ILinkBehaveOptions): number | null;
  getLinkDirectionalArrowRelPos?(options: ILinkBehaveOptions): number | null;
  getLinkDirectionalParticleColor?(options: ILinkBehaveOptions): string | null;
  getLinkDirectionalParticleSpeed?(options: ILinkBehaveOptions): number | null;
  getLinkDirectionalParticleWidth?(options: ILinkBehaveOptions): number | null;
  getLinkDirectionalParticles?(options: ILinkBehaveOptions): number | null;
  // node
  getNodeColor?(options: INodeBehaveOptions): string | null;
  getNodeLabel?(options: INodeBehaveOptions): string | null;
  getNodeSize?(options: INodeBehaveOptions): number | null;
  getNodeCanvasObject?(options: INodeCanvasBehaveOptions): any;
  getNodeThreeObject?(options: INodeThreeBehaveOptions): THREE.Object3D | null;
  // evented
  onNodeClick?(options: INodeEventBehaveOptions): boolean;
  onLinkClick?(options: ILinkEventBehaveOptions): boolean;
  onRender?(options: IRenderOptions): void;
}

export const ALL_LINK_METHODS = [
  'getLinkLabel',
  'getLinkColor',
  'getLinkCurvature',
  'getLinkLineDash',
  'getLinkWidth',
  'getLinkDirectionalArrowColor',
  'getLinkDirectionalArrowLength',
  'getLinkDirectionalArrowRelPos',
  'getLinkDirectionalParticleColor',
  'getLinkDirectionalParticleSpeed',
  'getLinkDirectionalParticleWidth',
  'getLinkDirectionalParticles',
  'onLinkClick',
];
export type TLinkBehaveMethod = (typeof ALL_LINK_METHODS)[number];

export const ALL_NODE_METHODS = [
  'getNodeLabel',
  'getNodeColor',
  'getNodeSize',
  'getNodeCanvasObject',
  'getNodeThreeObject',
  'onNodeClick',
];
export type TNodeBehaveMethod = (typeof ALL_NODE_METHODS)[number];

export const ALL_GRAPH_METHODS = ['onRender'];
export type TGraphBehaveMethod = (typeof ALL_GRAPH_METHODS)[number];

export type TNodeMethodMap = Map<TNodeBehaveMethod, IBehave[]>;
export type TLinkMethodMap = Map<TLinkBehaveMethod, IBehave[]>;
export type TGraphMethodMap = Map<TGraphBehaveMethod, IBehave[]>;

export interface IBehaveOptions {
  view: IHasGraph;
  graphData: GraphData;
}

export interface INodeBehaveOptions extends IBehaveOptions {
  node: NodeObject;
}

export interface INodeCanvasBehaveOptions extends INodeBehaveOptions {
  context: CanvasRenderingContext2D;
  globalScale: number;
}

export interface INodeThreeBehaveOptions extends INodeBehaveOptions {
  iframeClasses: Record<string, any>;
}

export interface INodeEventBehaveOptions extends INodeBehaveOptions {
  event: MouseEvent;
  index: number;
}

export interface ILinkBehaveOptions extends IBehaveOptions {
  link: LinkObject;
  index: number;
}

export interface ILinkEventBehaveOptions extends ILinkBehaveOptions {
  event: MouseEvent;
}

export interface IRenderOptions extends IBehaveOptions {
  context2d?: CanvasRenderingContext2D;
  renderer3d?: THREE.WebGLRenderer;
  globalScale?: number;
  time?: number;
}

export interface IHasGraph<T = any> extends DOMWidgetView {
  graph: T;
  source: ISource;
  rendered: Promise<void>;
  wrapFunction: (fn: Function) => Function;
  model: ForceGraphModel;
}

export interface IPreservedColumns {
  nodes: string[];
  links: string[];
}

export interface ISource {
  graphData: GraphData;
  mergePreserved(
    graphData: GraphData,
    oldGraphData: GraphData,
    preservedColumns: IPreservedColumns
  ): GraphData | null;
  dataUpdated: ISignal<ISource, void>;
}

export type TAnyForce =
  | d3Force3d.forceCenter
  | d3Force3d.forceCollide
  | d3Force3d.forceLink
  | d3Force3d.forceManyBody
  | d3Force3d.forceRadial
  | d3Force3d.forceSimulation
  | d3Force3d.forceX
  | d3Force3d.forceY
  | d3Force3d.forceZ;

export interface IForce {
  forceFactory(): TAnyForce;
}

export type TSelectedSet = Set<string | number>;

export const emptyArray = Object.freeze([]);
export const emptyPreservedColumns = Object.freeze({
  nodes: emptyArray,
  links: emptyArray,
}) as IPreservedColumns;

export interface IDynamicCallable {
  (...args: any): string;
}

export type TCustomAction = 'reheat';

export interface IActionMessage {
  action: TCustomAction;
}

/**
 * Strings that should be interpreted as `false` after being lowercased and trimmed.
 */
export const FALSEY = Object.freeze([
  '',
  '()',
  '[]',
  '{}',
  '0.0',
  '0',
  'false',
  'nan',
  'none',
  'null',
]);

export enum ECoerce {
  array = 'array',
  boolish = 'boolean',
  numeric = 'number',
}

export interface IExtraColumns {
  nodes: string[];
  links: string[];
}

export enum EMark {
  node = 'node',
  link = 'link',
}
