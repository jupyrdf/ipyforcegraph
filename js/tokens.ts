/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type d3Force3d from 'd3-force-3d';
import type {
  ForceGraphInstance,
  GraphData,
  LinkObject,
  NodeObject,
} from 'force-graph';
import type THREE from 'three';

import type { Throttler } from '@lumino/polling';
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

export interface IUpdateGraphCameraOptions {
  graph: ForceGraphInstance;
  iframeClasses?: Record<string, any>;
}

export interface IBehave extends WidgetModel {
  rank: number;
  updateRequested: ISignal<IBehave, TUpdateKind>;
  extraColumns?: IExtraColumns;

  // custom signals
  graphDataUpdateRequested: ISignal<IBehave, void>;
  updateGraphData?(graphData: GraphData): Promise<void>;

  // custom signals
  graphCameraUpdateRequested: ISignal<IBehave, void>;
  updateGraphCamera?(options: IUpdateGraphCameraOptions): Promise<void>;

  // link
  getLinkCanvasObject?(options: ILinkCanvasBehaveOptions): any;
  getLinkColor?(options: ILinkBehaveOptions): string | null;
  getLinkCurvature?(options: ILinkBehaveOptions): number | null;
  getLinkDirectionalArrowColor?(options: ILinkBehaveOptions): string | null;
  getLinkDirectionalArrowLength?(options: ILinkBehaveOptions): number | null;
  getLinkDirectionalArrowRelPos?(options: ILinkBehaveOptions): number | null;
  getLinkDirectionalParticleColor?(options: ILinkBehaveOptions): string | null;
  getLinkDirectionalParticles?(options: ILinkBehaveOptions): number | null;
  getLinkDirectionalParticleSpeed?(options: ILinkBehaveOptions): number | null;
  getLinkDirectionalParticleWidth?(options: ILinkBehaveOptions): number | null;
  getLinkLabel?(options: ILinkBehaveOptions): string | null;
  getLinkLineDash?(options: ILinkBehaveOptions): number[] | null;
  getLinkThreeObject?(options: ILinkThreeBehaveOptions): THREE.Object3D | null;
  getLinkWidth?(options: ILinkBehaveOptions): number | null;
  getLinkPosition?(options: ILinkThreeBehaveOptions): void;
  // node
  getNodeCanvasObject?(options: INodeCanvasBehaveOptions): any;
  getNodeColor?(options: INodeBehaveOptions): string | null;
  getNodeLabel?(options: INodeBehaveOptions): string | null;
  getNodeSize?(options: INodeBehaveOptions): number | null;
  getNodeThreeObject?(options: INodeThreeBehaveOptions): THREE.Object3D | null;
  // evented
  onLinkClick?(options: ILinkEventBehaveOptions): boolean;
  onNodeClick?(options: INodeEventBehaveOptions): boolean;
  onRender?(options: IRenderOptions): void;
  onZoom?(zoomData: IZoomData): void;
}
export enum ELinkBehaveMethod {
  getLinkLabel = 0,
  getLinkColor = 1,
  getLinkCurvature = 2,
  getLinkLineDash = 3,
  getLinkWidth = 4,
  getLinkDirectionalArrowColor = 5,
  getLinkDirectionalArrowLength = 6,
  getLinkDirectionalArrowRelPos = 7,
  getLinkDirectionalParticleColor = 8,
  getLinkDirectionalParticleSpeed = 9,
  getLinkDirectionalParticleWidth = 10,
  getLinkDirectionalParticles = 11,
  onLinkClick = 12,
  getLinkCanvasObject = 13,
  getLinkThreeObject = 14,
  getLinkPosition = 15,
}

export const ALL_LINK_METHODS = {
  getLinkLabel: ELinkBehaveMethod.getLinkLabel,
  getLinkColor: ELinkBehaveMethod.getLinkColor,
  getLinkCurvature: ELinkBehaveMethod.getLinkCurvature,
  getLinkLineDash: ELinkBehaveMethod.getLinkLineDash,
  getLinkWidth: ELinkBehaveMethod.getLinkWidth,
  getLinkDirectionalArrowColor: ELinkBehaveMethod.getLinkDirectionalArrowColor,
  getLinkDirectionalArrowLength: ELinkBehaveMethod.getLinkDirectionalArrowLength,
  getLinkDirectionalArrowRelPos: ELinkBehaveMethod.getLinkDirectionalArrowRelPos,
  getLinkDirectionalParticleColor: ELinkBehaveMethod.getLinkDirectionalParticleColor,
  getLinkDirectionalParticleSpeed: ELinkBehaveMethod.getLinkDirectionalParticleSpeed,
  getLinkDirectionalParticleWidth: ELinkBehaveMethod.getLinkDirectionalParticleWidth,
  getLinkDirectionalParticles: ELinkBehaveMethod.getLinkDirectionalParticles,
  onLinkClick: ELinkBehaveMethod.onLinkClick,
  getLinkCanvasObject: ELinkBehaveMethod.getLinkCanvasObject,
  getLinkThreeObject: ELinkBehaveMethod.getLinkThreeObject,
  getLinkPosition: ELinkBehaveMethod.getLinkPosition,
};
export type TLinkBehaveMethod = keyof typeof ALL_LINK_METHODS;

export enum ENodeBehaveMethod {
  getNodeLabel = 0,
  getNodeColor = 1,
  getNodeSize = 2,
  getNodeCanvasObject = 3,
  getNodeThreeObject = 4,
  onNodeClick = 5,
}

export const ALL_NODE_METHODS = {
  getNodeLabel: ENodeBehaveMethod.getNodeLabel,
  getNodeColor: ENodeBehaveMethod.getNodeColor,
  getNodeSize: ENodeBehaveMethod.getNodeSize,
  getNodeCanvasObject: ENodeBehaveMethod.getNodeCanvasObject,
  getNodeThreeObject: ENodeBehaveMethod.getNodeThreeObject,
  onNodeClick: ENodeBehaveMethod.onNodeClick,
};
export type TNodeBehaveMethod = keyof typeof ALL_NODE_METHODS;

export enum EGraphBehaveMethod {
  onRender = 0,
  onZoom = 1,
}
export const ALL_GRAPH_METHODS = {
  onRender: EGraphBehaveMethod.onRender,
  onZoom: EGraphBehaveMethod.onZoom,
};
export type TGraphBehaveMethod = keyof typeof ALL_GRAPH_METHODS;

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

export interface ILinkCanvasBehaveOptions extends ILinkBehaveOptions {
  context: CanvasRenderingContext2D;
}

export interface ILinkThreeBehaveOptions extends ILinkBehaveOptions {
  iframeClasses: Record<string, any>;
  sprite?: THREE.Object3D;
  position?: IThreeLinkPosition;
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

export type TCoercer = (value: any) => any;

export interface IExtraColumns {
  nodes: string[];
  links: string[];
}

export enum EMark {
  node = 'node',
  link = 'link',
}

export interface IZoomData {
  x: number;
  y: number;
  z?: number;
  k?: number;
  lookAt?: THREE.Vector3;
  graph: ForceGraphInstance;
  iframeClasses?: Record<string, any>;
}

export const THROTTLE_OPTS: Throttler.IOptions = { limit: 200, edge: 'trailing' };

export interface IThreePoint {
  x: number;
  y: number;
  z: number;
}

export interface IThreeLinkPosition {
  start: IThreePoint;
  end: IThreePoint;
}
