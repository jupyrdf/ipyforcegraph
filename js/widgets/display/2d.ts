/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { ObjectHash } from 'backbone';
import type {
  ForceGraphGenericInstance,
  ForceGraphInstance,
  GraphData,
  LinkObject,
  NodeObject,
} from 'force-graph';

import { PromiseDelegate } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';

import {
  DOMWidgetModel,
  DOMWidgetView,
  IBackboneModelOptions,
  WidgetView,
  unpack_models as deserialize,
} from '@jupyter-widgets/base';

import {
  ALL_GRAPH_METHODS,
  ALL_LINK_METHODS,
  ALL_NODE_METHODS,
  CSS,
  DEBUG,
  DEFAULT_COLORS,
  DEFAULT_WIDTHS,
  EMOJI,
  EMPTY_GRAPH_DATA,
  EUpdate,
  IActionMessage,
  IBehave,
  IHasGraph,
  ILinkBehaveOptions,
  ILinkEventBehaveOptions,
  INodeBehaveOptions,
  INodeCanvasBehaveOptions,
  INodeEventBehaveOptions,
  IRenderOptions,
  ISource,
  TAnyForce,
  TGraphBehaveMethod,
  TGraphMethodMap,
  TLinkBehaveMethod,
  TLinkMethodMap,
  TNodeBehaveMethod,
  TNodeMethodMap,
  TUpdateKind,
  WIDGET_DEFAULTS,
  emptyArray,
} from '../../tokens';
import { DAGBehaviorModel, FacetedForceModel, GraphForcesModel } from '../behaviors';

export class ForceGraphModel extends DOMWidgetModel {
  static model_name = 'ForceGraphModel';
  static serializers = {
    ...DOMWidgetModel.serializers,
    source: { deserialize },
    behaviors: { deserialize },
  };

  protected _nodeBehaviorsByMethod: TNodeMethodMap;
  protected _linkBehaviorsByMethod: TLinkMethodMap;
  protected _graphBehaviorsByMethod: TGraphMethodMap;
  protected _forceBehaviors: GraphForcesModel[];
  protected _behaviorsChanged: Signal<ForceGraphModel, void>;

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: ForceGraphModel.model_name,
      _view_name: ForceGraphView.view_name,
      source: null,
      behaviors: [],
      background_color: DEFAULT_COLORS.background,
      default_link_color: DEFAULT_COLORS.link,
      default_link_width: DEFAULT_WIDTHS.link,
      default_node_color: DEFAULT_COLORS.node,
      default_node_size: DEFAULT_WIDTHS.node,
    };
  }

  initialize(attributes: ObjectHash, options: IBackboneModelOptions): void {
    super.initialize(attributes, options);
    this.on('change:behaviors', this.onBehaviorsChange, this);
    void this.onBehaviorsChange();
  }

  async onBehaviorsChange(): Promise<void> {
    if (!this._behaviorsChanged) {
      this._behaviorsChanged = new Signal(this);
      this._linkBehaviorsByMethod = new Map();
      this._nodeBehaviorsByMethod = new Map();
      this._graphBehaviorsByMethod = new Map();
    }
    const { behaviors } = this;

    for (let linkMethod of ALL_LINK_METHODS) {
      let methodBehaviors: IBehave[] = [];
      for (const behavior of behaviors) {
        if (behavior[linkMethod]) {
          methodBehaviors.push(behavior);
        }
      }
      this._linkBehaviorsByMethod.set(linkMethod, methodBehaviors);
    }

    for (let nodeMethod of ALL_NODE_METHODS) {
      let methodBehaviors: IBehave[] = [];
      for (const behavior of behaviors) {
        if (behavior[nodeMethod]) {
          methodBehaviors.push(behavior);
        }
      }
      this._nodeBehaviorsByMethod.set(nodeMethod, methodBehaviors);
    }

    for (let graphMethod of ALL_GRAPH_METHODS) {
      let graphBehaviors: IBehave[] = [];
      for (const behavior of behaviors) {
        if (behavior[graphMethod]) {
          graphBehaviors.push(behavior);
        }
      }
      this._graphBehaviorsByMethod.set(graphMethod, graphBehaviors);
    }

    this._forceBehaviors = [];
    for (const behavior of behaviors) {
      if (behavior instanceof GraphForcesModel) {
        this._forceBehaviors.push(behavior);
      }
    }

    this._behaviorsChanged.emit(void 0);
  }

  linkBehaviorsForMethod(method: TLinkBehaveMethod): readonly IBehave[] {
    return this._linkBehaviorsByMethod.get(method) || emptyArray;
  }

  nodeBehaviorsForMethod(method: TNodeBehaveMethod): readonly IBehave[] {
    return this._nodeBehaviorsByMethod.get(method) || emptyArray;
  }

  graphBehaviorsForMethod(method: TGraphBehaveMethod): readonly IBehave[] {
    return this._graphBehaviorsByMethod.get(method) || emptyArray;
  }

  get forceBehaviors(): readonly GraphForcesModel[] {
    return this._forceBehaviors;
  }

  get graphData(): GraphData {
    const source = this.get('source');
    return source ? source.graphData : EMPTY_GRAPH_DATA;
  }

  get behaviors(): IBehave[] {
    return this.get('behaviors') || [];
  }

  get behaviorsChanged(): ISignal<ForceGraphModel, void> {
    return this._behaviorsChanged;
  }

  get previousBehaviors(): IBehave[] {
    return (this.previous && this.previous('behaviors')) || [];
  }

  get defaultNodeColor(): string {
    return this.get('default_node_color') || DEFAULT_COLORS.node;
  }

  get defaultNodeSize(): string {
    return this.get('default_node_size') || DEFAULT_WIDTHS.node;
  }

  get defaultLinkColor(): string {
    return this.get('default_link_color') || DEFAULT_COLORS.link;
  }

  get defaultLinkWidth(): string {
    return this.get('default_link_width') || DEFAULT_WIDTHS.link;
  }

  get backgroundColor(): string {
    return this.get('background_color') || DEFAULT_COLORS.background;
  }
}

export class ForceGraphView<T = ForceGraphGenericInstance<ForceGraphInstance>>
  extends DOMWidgetView
  implements IHasGraph<T>
{
  static view_name = 'ForceGraphView';
  graph: T;
  model: ForceGraphModel;

  protected _rendered: PromiseDelegate<void>;
  protected _iframe: HTMLIFrameElement | null;
  protected _iframeClasses: Record<string, any>;

  get source(): ISource {
    return this.model.get('source');
  }

  get previousSource(): ISource | null {
    return (this.model.previous && this.model.previous('source')) || null;
  }

  get rendered(): Promise<void> {
    return this._rendered.promise;
  }

  initialize(parameters: WidgetView.IInitializeParameters<ForceGraphModel>) {
    super.initialize(parameters);
    this.luminoWidget.addClass(CSS.widget);
    this.luminoWidget.addClass(`${CSS.widget}-${this.graphJsClass}`);
    this._rendered = new PromiseDelegate();
    this.model.on('change:source', this.onSourceChange, this);
    this.model.on(
      'change:default_node_color change:default_link_color change:background_color change:default_node_size change:default_link_width',
      this.postUpdate,
      this
    );

    this.model.behaviorsChanged.connect(this.onBehaviorsChange, this);
    this.luminoWidget.disposed.connect(this.onDisposed, this);
    this.model.on('msg:custom', this.handleMessage, this);
    this.onSourceChange();
    void this.onBehaviorsChange();
  }

  handleMessage(message: IActionMessage): void {
    const graph = this.graph as ForceGraphInstance;

    if (!graph) {
      console.warn(`${EMOJI} graph was not yet initialized, discarding`, message);
      return;
    }

    switch (message.action) {
      case 'reheat':
        graph.d3ReheatSimulation();
        break;
      default:
        const exhaustiveCheck: never = message.action;
        console.error(`${EMOJI} Unhandled custom action: ${exhaustiveCheck}`);
    }
  }

  onDisposed() {
    if (this.graph) {
      (this.graph as any)._destructor();
      delete this.graph;
      this.graph = null;
    }

    if (this._iframe) {
      this._iframe.removeEventListener('resize', this.onWindowResize);
      this._iframe.onload = null;
      delete this._iframe;
      this._iframe = null;
    }

    this.luminoWidget.disposed.disconnect(this.onDisposed);
  }

  async render(): Promise<void> {
    const root = this.el as HTMLDivElement;
    const iframe = document.createElement('iframe');
    const iframeSrc = await this.getIframeSource();
    iframe.setAttribute('srcdoc', iframeSrc);
    iframe.onload = this.onFrameLoaded;
    root.appendChild(iframe);
    this._iframe = iframe;
  }

  protected onFrameLoaded = async (event: Event) => {
    const iframe = event.currentTarget as HTMLIFrameElement;
    const { contentWindow } = iframe;

    const initResult = (contentWindow as any).init();

    const graph: ForceGraphInstance = initResult.graph;
    this._iframeClasses = initResult.iframeClasses;
    this.graph = graph as any;
    contentWindow.addEventListener('resize', this.onWindowResize);
    this._rendered.resolve(void 0);
    await this.redraw();
  };

  protected onWindowResize = () => {
    const { contentWindow } = this._iframe;
    const graph: ForceGraphInstance = this.graph as any;
    graph.width(contentWindow.innerWidth);
    graph.height(contentWindow.innerHeight);
  };

  protected async getJsUrls(): Promise<string[]> {
    return [
      (
        await import(
          '!!file-loader!../../../node_modules/force-graph/dist/force-graph.js'
        )
      ).default as any,
    ];
  }

  protected get graphJsClass(): string {
    return 'ForceGraph';
  }

  protected get extraJsClasses(): string {
    return '{}';
  }

  protected async getIframeSource(): Promise<string> {
    let urls = await this.getJsUrls();

    let scripts = '';

    for (const url of urls) {
      scripts += `<script src="${url}"></script>\n`;
    }

    let src = `
      <head>
        ${scripts}
        <style>
          body, #main {
            overflow: hidden;
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <script>
          window.process = {
            env: {
              NODE_ENV: '${DEBUG ? 'development' : 'production'}'
            }
          };
          window.init = (args) => {
            const div = document.createElement('div');
            document.body.appendChild(div);
            return {
              graph: ${this.graphJsClass}(args || {})(div),
              iframeClasses: ${this.extraJsClasses}
            };
          }
          window.wrapFunction = (fn) => {
            return (...args) => fn(...args);
          }
        </script>
      </body>
    `;
    return src;
  }

  async redraw(): Promise<void> {
    await this._rendered.promise;
    let { graphData } = this.model;
    DEBUG && console.warn(`${EMOJI} updating...`, graphData);
    await this.postUpdate();
    (this.graph as any).graphData(graphData);
  }

  wrapFunction = (fn: Function) => {
    return (this._iframe.contentWindow as any).wrapFunction(fn);
  };

  onSourceChange(change?: any) {
    const { source, previousSource } = this;

    if (previousSource) {
      previousSource.dataUpdated.disconnect(this.redraw, this);
    }

    if (source) {
      source.dataUpdated.connect(this.redraw, this);
      this.redraw();
    }
  }

  protected async ensureAllFacets() {
    let facetPromises: Promise<void>[] = [];

    for (const behavior of this.model.behaviors) {
      // TOOD: remove the any
      if ((behavior as any).ensureFacets) {
        facetPromises.push((behavior as any).ensureFacets());
      }
    }

    if (facetPromises.length) {
      await Promise.all(facetPromises);
    }
  }

  protected async postUpdate(caller?: any, kind?: TUpdateKind): Promise<void> {
    await this.rendered;
    const graph = this.graph as ForceGraphInstance;
    if (!graph) {
      console.warn(`${EMOJI} no graph to postUpdate`);
      return;
    }

    if (kind && EUpdate.Behavior === (kind & EUpdate.Behavior)) {
      await this.model.onBehaviorsChange();
      return;
    }

    await this.ensureAllFacets();

    const {
      backgroundColor,
      defaultLinkColor,
      defaultNodeColor,
      defaultLinkWidth,
      defaultNodeSize,
    } = this.model;

    // graph
    graph.backgroundColor(backgroundColor);

    // link
    graph.linkColor(
      this.model.linkBehaviorsForMethod('getLinkColor').length
        ? this.wrapFunction(this.getLinkColor)
        : this.wrapFunction(() => defaultLinkColor)
    );
    graph.linkWidth(
      this.model.linkBehaviorsForMethod('getLinkWidth').length
        ? this.wrapFunction(this.getLinkWidth)
        : this.wrapFunction(() => defaultLinkWidth)
    );
    graph.linkLabel(
      this.model.linkBehaviorsForMethod('getLinkLabel').length
        ? this.wrapFunction(this.getLinkLabel)
        : null
    );

    graph.linkDirectionalArrowColor(
      this.model.linkBehaviorsForMethod('getLinkDirectionalArrowColor').length
        ? this.wrapFunction(this.getLinkDirectionalArrowColor)
        : null
    );
    graph.linkDirectionalArrowLength(
      this.model.linkBehaviorsForMethod('getLinkDirectionalArrowLength').length
        ? this.wrapFunction(this.getLinkDirectionalArrowLength)
        : null
    );
    graph.linkDirectionalArrowRelPos(
      this.model.linkBehaviorsForMethod('getLinkDirectionalArrowRelPos').length
        ? this.wrapFunction(this.getLinkDirectionalArrowRelPos)
        : null
    );
    graph.linkDirectionalParticleColor(
      this.model.linkBehaviorsForMethod('getLinkDirectionalParticleColor').length
        ? this.wrapFunction(this.getLinkDirectionalParticleColor)
        : null
    );
    graph.linkDirectionalParticleSpeed(
      this.model.linkBehaviorsForMethod('getLinkDirectionalParticleSpeed').length
        ? this.wrapFunction(this.getLinkDirectionalParticleSpeed)
        : null
    );
    graph.linkDirectionalParticleWidth(
      this.model.linkBehaviorsForMethod('getLinkDirectionalParticleWidth').length
        ? this.wrapFunction(this.getLinkDirectionalParticleWidth)
        : null
    );
    graph.linkDirectionalParticles(
      this.model.linkBehaviorsForMethod('getLinkDirectionalParticles').length
        ? this.wrapFunction(this.getLinkDirectionalParticles)
        : null
    );

    // node
    graph.nodeColor(
      this.model.nodeBehaviorsForMethod('getNodeColor').length
        ? this.wrapFunction(this.getNodeColor)
        : this.wrapFunction(() => defaultNodeColor)
    );
    graph.nodeVal(
      this.model.nodeBehaviorsForMethod('getNodeSize').length
        ? this.wrapFunction(this.getNodeSize)
        : this.wrapFunction(() => defaultNodeSize)
    );
    graph.nodeLabel(
      this.model.nodeBehaviorsForMethod('getNodeLabel').length
        ? this.wrapFunction(this.getNodeLabel)
        : null
    );

    // evented
    graph.onNodeClick(
      this.model.nodeBehaviorsForMethod('onNodeClick').length
        ? this.wrapFunction(this.onNodeClick)
        : null
    );
    graph.onLinkClick(
      this.model.linkBehaviorsForMethod('onLinkClick').length
        ? this.wrapFunction(this.onLinkClick)
        : null
    );

    // forces
    this.getForceUpdate();

    // finally, (3d-)force-graph-specific after all other behaviors
    this.getOnRenderPostUpdate();

    if (kind && EUpdate.Reheat === (kind & EUpdate.Reheat)) {
      graph.d3ReheatSimulation();
    }
  }

  protected getForceUpdate() {
    const graph = this.graph as ForceGraphInstance;
    let needsPost: TAnyForce[] = [];

    for (let simBehavior of this.model.forceBehaviors) {
      const { warmupTicks, cooldownTicks, alphaDecay, alphaMin, velocityDecay } =
        simBehavior;
      simBehavior.checkPositions(graph);
      graph.cooldownTicks(cooldownTicks);
      graph.warmupTicks(warmupTicks);
      graph.d3AlphaDecay(alphaDecay);
      graph.d3AlphaMin(alphaMin);
      graph.d3VelocityDecay(velocityDecay);

      for (let key in simBehavior.forces) {
        let behavior: FacetedForceModel | null = simBehavior.forces[key];
        let force = behavior?.force || null;
        if (force && !behavior?.active) {
          force = null;
        }

        // DAG behavior is treated different compared to other pure D3 Forces.
        if (behavior instanceof DAGBehaviorModel) {
          (behavior as DAGBehaviorModel).refreshBehavior(graph);
        } else {
          graph.d3Force(key, force);
        }

        if (force?.links) {
          needsPost.push(force);
        }
      }
    }
    if (needsPost.length) {
      setTimeout(this.postForceUpdate, 250, needsPost);
    }
  }

  protected postForceUpdate = (forces: TAnyForce[]) => {
    const { links } = (this.graph as ForceGraphInstance).graphData();
    if (!links.length) {
      return;
    }
    const firstSource = typeof links[0].source;
    if (firstSource === 'string' || firstSource === 'number') {
      setTimeout(this.postForceUpdate, 250, forces);
      DEBUG && console.log('Polling postForceUpdate...');
      return;
    }
    for (let force of forces) {
      if (force.links) {
        force.links(links);
      }
    }
  };

  protected getOnRenderPostUpdate() {
    const graph = this.graph as ForceGraphInstance;

    graph.nodeCanvasObject(
      this.model.nodeBehaviorsForMethod('getNodeCanvasObject').length
        ? this.wrapFunction(this.getNodeCanvasObject)
        : null
    );

    graph.onRenderFramePost(
      this.model.graphBehaviorsForMethod('onRender').length
        ? this.wrapFunction(this.onRender)
        : null
    );
  }

  // composable behaviors
  async onBehaviorsChange(): Promise<void> {
    const { behaviors, previousBehaviors } = this.model;

    for (const behavior of previousBehaviors) {
      behavior.updateRequested.disconnect(this.postUpdate, this);
    }

    for (const behavior of behaviors) {
      behavior.updateRequested.connect(this.postUpdate, this);
    }

    await this.postUpdate();
  }

  // link behaviors
  protected getLinkColor = (link: LinkObject): string => {
    return this.getComposedLinkAttr(link, 'getLinkColor', this.model.defaultLinkColor);
  };
  protected getLinkWidth = (link: LinkObject): string => {
    return this.getComposedLinkAttr(link, 'getLinkWidth', this.model.defaultLinkWidth);
  };

  protected getLinkLabel = (link: LinkObject): string => {
    return this.getComposedLinkAttr(link, 'getLinkLabel', '');
  };

  protected getLinkDirectionalArrowColor = (link: LinkObject): string => {
    return this.getComposedLinkAttr(link, 'getLinkDirectionalArrowColor', '');
  };

  protected getLinkDirectionalArrowLength = (link: LinkObject): string => {
    return this.castToNumber(
      this.getComposedLinkAttr(link, 'getLinkDirectionalArrowLength', '')
    );
  };

  protected getLinkDirectionalArrowRelPos = (link: LinkObject): string => {
    return this.castToNumber(
      this.getComposedLinkAttr(link, 'getLinkDirectionalArrowRelPos', '')
    );
  };

  protected getLinkDirectionalParticleColor = (link: LinkObject): string => {
    return this.getComposedLinkAttr(link, 'getLinkDirectionalParticleColor', '');
  };

  protected getLinkDirectionalParticleSpeed = (link: LinkObject): string => {
    return this.castToNumber(
      this.getComposedLinkAttr(link, 'getLinkDirectionalParticleSpeed', '')
    );
  };

  protected getLinkDirectionalParticleWidth = (link: LinkObject): string => {
    return this.castToNumber(
      this.getComposedLinkAttr(link, 'getLinkDirectionalParticleWidth', '')
    );
  };

  protected getLinkDirectionalParticles = (link: LinkObject): string => {
    return this.castToNumber(
      this.getComposedLinkAttr(link, 'getLinkDirectionalParticles', '')
    );
  };

  protected castToNumber(value: string | number | null): any {
    if (value == null) {
      return value as any;
    } else if (typeof value == 'string') {
      return parseFloat(value);
    }
    return value;
  }

  getComposedLinkAttr(
    link: LinkObject,
    methodName: TLinkBehaveMethod,
    defaultValue: string
  ) {
    let value: string | null;
    const graphData = (this.graph as ForceGraphInstance).graphData();
    const options: ILinkBehaveOptions = {
      view: this,
      index: graphData.links.indexOf(link),
      graphData,
      link,
    };

    for (const behavior of this.model.linkBehaviorsForMethod(methodName)) {
      let method = behavior[methodName];
      value = method.call(behavior, options);
      if (value != null) {
        break;
      }
    }

    return value != null ? value : defaultValue;
  }

  // node behaviors
  protected getNodeColor = (node: NodeObject): string => {
    return this.getComposedNodeAttr(node, 'getNodeColor', this.model.defaultNodeColor);
  };

  protected getNodeLabel = (node: NodeObject): string => {
    return this.getComposedNodeAttr(node, 'getNodeLabel', '');
  };

  protected getNodeSize = (node: NodeObject): string => {
    return this.getComposedNodeAttr(node, 'getNodeSize', this.model.defaultNodeSize);
  };

  protected getNodeCanvasObject = (
    node: NodeObject,
    context: CanvasRenderingContext2D,
    globalScale: number
  ): void => {
    let value: string | null;
    const graphData = (this.graph as ForceGraphInstance).graphData();
    const options: INodeCanvasBehaveOptions = {
      view: this,
      context,
      graphData,
      node,
      globalScale,
    };

    for (const behavior of this.model.nodeBehaviorsForMethod('getNodeCanvasObject')) {
      let method = behavior.getNodeCanvasObject;
      value = method.call(behavior, options);
      if (value != null) {
        break;
      }
    }
  };

  getComposedNodeAttr(
    node: NodeObject,
    methodName: TNodeBehaveMethod,
    defaultValue: string
  ) {
    let value: string | null;
    const graphData = (this.graph as ForceGraphInstance).graphData();
    const options: INodeBehaveOptions = {
      view: this,
      graphData,
      node,
    };

    for (const behavior of this.model.nodeBehaviorsForMethod(methodName)) {
      let method = behavior[methodName];
      value = method.call(behavior, options);
      if (value != null) {
        break;
      }
    }

    return value != null ? value : defaultValue;
  }

  protected onNodeClick = (node: NodeObject, event: MouseEvent) => {
    const graphData = (this.graph as ForceGraphInstance).graphData();
    let shouldContinue = true;
    const options: INodeEventBehaveOptions = {
      view: this,
      graphData,
      event,
      node,
      index: node['index'] != null ? node['index'] : graphData.nodes.indexOf(node),
    };
    for (const behavior of this.model.nodeBehaviorsForMethod('onNodeClick')) {
      shouldContinue = behavior.onNodeClick(options);
      if (!shouldContinue) {
        return;
      }
    }
  };

  protected onLinkClick = (link: LinkObject, event: MouseEvent) => {
    const graphData = (this.graph as ForceGraphInstance).graphData();
    let shouldContinue = true;
    const options: ILinkEventBehaveOptions = {
      view: this,
      graphData,
      event,
      link,
      index: link['index'] != null ? link['index'] : graphData.links.indexOf(link),
    };
    for (const behavior of this.model.linkBehaviorsForMethod('onLinkClick')) {
      shouldContinue = behavior.onLinkClick(options);
      if (!shouldContinue) {
        return;
      }
    }
  };

  protected updateRenderOptions(options: IRenderOptions): IRenderOptions {
    return options;
  }

  protected onRender = (ctx: CanvasRenderingContext2D, globalScale: any) => {
    const graphData = (this.graph as ForceGraphInstance).graphData();
    let options: IRenderOptions = {
      view: this,
      graphData,
      context2d: ctx,
      globalScale,
    };
    options = this.updateRenderOptions(options);
    for (const behavior of this.model.graphBehaviorsForMethod('onRender')) {
      behavior.onRender(options);
    }
  };
}
