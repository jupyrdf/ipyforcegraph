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
import { Throttler } from '@lumino/polling';
import { ISignal, Signal } from '@lumino/signaling';

import {
  DOMWidgetModel,
  DOMWidgetView,
  IBackboneModelOptions,
  WidgetView,
} from '@jupyter-widgets/base';

import {
  CSS,
  DEBUG,
  DEFAULT_COLORS,
  DEFAULT_CURVATURES,
  DEFAULT_LINE_DASHES,
  DEFAULT_WIDTHS,
  EGraphBehaveMethod,
  ELinkBehaveMethod,
  EMOJI,
  EMPTY_GRAPH_DATA,
  ENodeBehaveMethod,
  EUpdate,
  IActionMessage,
  IBehave,
  IHasGraph,
  ILinkBehaveOptions,
  ILinkEventBehaveOptions,
  INodeBehaveOptions,
  INodeCanvasBehaveOptions,
  INodeEventBehaveOptions,
  IPreservedColumns,
  IRenderOptions,
  ISource,
  IZoomData,
  TAnyForce,
  THROTTLE_OPTS,
  TLinkBehaveMethod,
  TNodeBehaveMethod,
  TUpdateKind,
  WIDGET_DEFAULTS,
  emptyPreservedColumns,
} from '../../tokens';
import { DAGBehaviorModel, FacetedForceModel, GraphForcesModel } from '../behaviors';
import { widget_serialization } from '../serializers/widget';

export class ForceGraphModel extends DOMWidgetModel {
  static model_name = 'ForceGraphModel';
  static serializers = {
    ...DOMWidgetModel.serializers,
    source: widget_serialization,
    behaviors: widget_serialization,
  };

  protected _nodeBehaviorsByMethod: IBehave[][];
  protected _linkBehaviorsByMethod: IBehave[][];
  protected _graphBehaviorsByMethod: IBehave[][];
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
      default_link_curvature: DEFAULT_CURVATURES.link,
      default_link_line_dash: DEFAULT_LINE_DASHES.link,
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

  compareRank(behaviorA: IBehave, behaviorB: IBehave) {
    return (
      behaviorA.rank - behaviorB.rank ||
      parseInt(behaviorA.cid.slice(1)) - parseInt(behaviorB.cid.slice(1))
    );
  }

  async onBehaviorsChange(): Promise<void> {
    if (!this._behaviorsChanged) {
      this._behaviorsChanged = new Signal(this);
      this._linkBehaviorsByMethod = [];
      this._nodeBehaviorsByMethod = [];
      this._graphBehaviorsByMethod = [];
    }
    const { behaviors } = this;

    for (let [linkMethod, eLinkMethod] of Object.entries(ELinkBehaveMethod)) {
      let methodBehaviors: IBehave[] = [];
      for (const behavior of behaviors) {
        if (behavior[linkMethod]) {
          methodBehaviors.push(behavior);
        }
      }
      this._linkBehaviorsByMethod[eLinkMethod] = methodBehaviors.sort(this.compareRank);
    }

    for (let [nodeMethod, eNodeMethod] of Object.entries(ENodeBehaveMethod)) {
      let methodBehaviors: IBehave[] = [];
      for (const behavior of behaviors) {
        if (behavior[nodeMethod]) {
          methodBehaviors.push(behavior);
        }
      }
      this._nodeBehaviorsByMethod[eNodeMethod] = methodBehaviors.sort(this.compareRank);
    }

    for (let [graphMethod, eGraphMethod] of Object.entries(EGraphBehaveMethod)) {
      let graphBehaviors: IBehave[] = [];
      for (const behavior of behaviors) {
        if (behavior[graphMethod]) {
          graphBehaviors.push(behavior);
        }
      }

      this._graphBehaviorsByMethod[eGraphMethod] = graphBehaviors.sort(
        this.compareRank
      );
    }

    let forceBehaviors: GraphForcesModel[] = [];
    for (const behavior of behaviors) {
      if (behavior instanceof GraphForcesModel) {
        forceBehaviors.push(behavior);
      }
    }
    this._forceBehaviors = forceBehaviors.sort(this.compareRank);

    this._behaviorsChanged.emit(void 0);
  }

  get linkBehaviorsByMethod(): IBehave[][] {
    return this._linkBehaviorsByMethod;
  }

  get nodeBehaviorsByMethod(): IBehave[][] {
    return this._nodeBehaviorsByMethod;
  }

  get graphBehaviorsByMethod(): IBehave[][] {
    return this._graphBehaviorsByMethod;
  }

  get forceBehaviors(): GraphForcesModel[] {
    return this._forceBehaviors;
  }

  get graphData(): GraphData {
    const source = this.get('source');
    return source ? source.graphData : EMPTY_GRAPH_DATA;
  }

  get preservedColumns(): IPreservedColumns {
    const source = this.get('source');
    return source ? source.preservedColumns : emptyPreservedColumns;
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

  get defaultLinkCurvature(): string {
    return this.get('default_link_curvature') || DEFAULT_CURVATURES.link;
  }

  get defaultLinkLineDash(): string {
    return this.get('default_link_line_dash') || DEFAULT_LINE_DASHES.link;
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

  protected _nodeBehaviorsByMethod: IBehave[][];
  protected _linkBehaviorsByMethod: IBehave[][];
  protected _graphBehaviorsByMethod: IBehave[][];

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
      'change:default_node_color change:default_link_color change:background_color change:default_node_size change:default_link_width change:default_link_curvature change:default_link_line_dash',
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
    await this.onGraphInitialized();
    await this.redraw();
  };

  protected async onGraphInitialized(): Promise<void> {
    // just for overloading
  }

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
            return (...args) => {
              return fn(...args);
            };
          }
        </script>
      </body>
    `;
    return src;
  }

  async redraw(): Promise<void> {
    await this._rendered.promise;
    await this.postUpdate();
    const graph = this.graph as any;
    if (!graph) {
      console.warn(`${EMOJI} no graph to redraw`);
      return;
    }
    graph.pauseAnimation();
    const { preservedColumns } = this.model;
    let graphData = this.model.graphData;
    const oldGraphData = graph.graphData();
    let needsFullRedraw = true;
    if (
      oldGraphData.nodes.length &&
      (preservedColumns.nodes.length || preservedColumns.links.length)
    ) {
      const { source } = this;
      graphData = source.mergePreserved(graphData, oldGraphData, preservedColumns);
      needsFullRedraw = graphData != null;
    }
    if (needsFullRedraw) {
      DEBUG && console.warn(`${EMOJI} updating...`, graphData);
      graph.graphData(graphData);
    }
    graph.resumeAnimation();
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

  protected async ensureBehaviorCache() {
    this._nodeBehaviorsByMethod = this.model.nodeBehaviorsByMethod;
    this._linkBehaviorsByMethod = this.model.linkBehaviorsByMethod;
    this._graphBehaviorsByMethod = this.model.graphBehaviorsByMethod;
  }

  protected async onGraphDataUpdateRequested(behavior: IBehave) {
    const graph = this.graph as ForceGraphInstance;
    if (graph && behavior.updateGraphData) {
      await behavior.updateGraphData(graph.graphData());
    }
  }

  protected async onGraphCameraUpdateRequested(behavior: IBehave) {
    const graph = this.graph as ForceGraphInstance;
    if (graph && behavior.updateGraphCamera) {
      await behavior.updateGraphCamera({ graph, iframeClasses: this._iframeClasses });
    }
  }

  protected async postUpdate(caller?: any, kind?: TUpdateKind): Promise<void> {
    await this.displayed;
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
    await this.ensureBehaviorCache();

    const { _linkBehaviorsByMethod, _nodeBehaviorsByMethod } = this;

    const {
      backgroundColor,
      defaultLinkColor,
      defaultNodeColor,
      defaultLinkWidth,
      defaultLinkCurvature,
      defaultLinkLineDash,
      defaultNodeSize,
    } = this.model;

    // graph
    graph.backgroundColor(backgroundColor);

    // link
    graph.linkColor(
      _linkBehaviorsByMethod[ELinkBehaveMethod.getLinkColor].length
        ? this.wrapFunction(this.getLinkColor)
        : this.wrapFunction(() => defaultLinkColor)
    );
    graph.linkWidth(
      _linkBehaviorsByMethod[ELinkBehaveMethod.getLinkWidth].length
        ? this.wrapFunction(this.getLinkWidth)
        : this.wrapFunction(() => defaultLinkWidth)
    );
    graph.linkCurvature(
      _linkBehaviorsByMethod[ELinkBehaveMethod.getLinkCurvature].length
        ? this.wrapFunction(this.getLinkCurvature)
        : this.wrapFunction(() => defaultLinkCurvature)
    );
    if (typeof graph['linkLineDash'] === 'function') {
      graph.linkLineDash(
        _linkBehaviorsByMethod[ELinkBehaveMethod.getLinkLineDash].length
          ? this.wrapFunction(this.getLinkLineDash)
          : this.wrapFunction(() => defaultLinkLineDash)
      );
    }
    graph.linkLabel(
      _linkBehaviorsByMethod[ELinkBehaveMethod.getLinkLabel].length
        ? this.wrapFunction(this.getLinkLabel)
        : null
    );

    graph.linkDirectionalArrowColor(
      _linkBehaviorsByMethod[ELinkBehaveMethod.getLinkDirectionalArrowColor].length
        ? this.wrapFunction(this.getLinkDirectionalArrowColor)
        : null
    );
    graph.linkDirectionalArrowLength(
      _linkBehaviorsByMethod[ELinkBehaveMethod.getLinkDirectionalArrowLength].length
        ? this.wrapFunction(this.getLinkDirectionalArrowLength)
        : null
    );
    graph.linkDirectionalArrowRelPos(
      _linkBehaviorsByMethod[ELinkBehaveMethod.getLinkDirectionalArrowRelPos].length
        ? this.wrapFunction(this.getLinkDirectionalArrowRelPos)
        : null
    );
    graph.linkDirectionalParticleColor(
      _linkBehaviorsByMethod[ELinkBehaveMethod.getLinkDirectionalParticleColor].length
        ? this.wrapFunction(this.getLinkDirectionalParticleColor)
        : null
    );
    graph.linkDirectionalParticleSpeed(
      _linkBehaviorsByMethod[ELinkBehaveMethod.getLinkDirectionalParticleSpeed].length
        ? this.wrapFunction(this.getLinkDirectionalParticleSpeed)
        : null
    );
    graph.linkDirectionalParticleWidth(
      _linkBehaviorsByMethod[ELinkBehaveMethod.getLinkDirectionalParticleWidth].length
        ? this.wrapFunction(this.getLinkDirectionalParticleWidth)
        : null
    );
    graph.linkDirectionalParticles(
      _linkBehaviorsByMethod[ELinkBehaveMethod.getLinkDirectionalParticles].length
        ? this.wrapFunction(this.getLinkDirectionalParticles)
        : null
    );

    // node
    graph.nodeColor(
      _nodeBehaviorsByMethod[ENodeBehaveMethod.getNodeColor].length
        ? this.wrapFunction(this.getNodeColor)
        : this.wrapFunction(() => defaultNodeColor)
    );
    graph.nodeVal(
      _nodeBehaviorsByMethod[ENodeBehaveMethod.getNodeSize].length
        ? this.wrapFunction(this.getNodeSize)
        : this.wrapFunction(() => defaultNodeSize)
    );
    graph.nodeLabel(
      _nodeBehaviorsByMethod[ENodeBehaveMethod.getNodeLabel].length
        ? this.wrapFunction(this.getNodeLabel)
        : null
    );

    // evented
    graph.onNodeClick(
      _nodeBehaviorsByMethod[ENodeBehaveMethod.onNodeClick].length
        ? this.wrapFunction(this.onNodeClick)
        : null
    );
    graph.onLinkClick(
      _linkBehaviorsByMethod[ELinkBehaveMethod.onLinkClick].length
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
      this._nodeBehaviorsByMethod[ENodeBehaveMethod.getNodeCanvasObject].length
        ? this.wrapFunction(this.getNodeCanvasObject)
        : null
    );

    graph.onRenderFramePost(
      this._graphBehaviorsByMethod[EGraphBehaveMethod.onRender].length
        ? this.wrapFunction(this.onRender)
        : null
    );

    if (this._graphBehaviorsByMethod[EGraphBehaveMethod.onZoom].length) {
      const throttled = new Throttler(
        this.wrapFunction((zoomData: any) => this.onZoom(zoomData)),
        THROTTLE_OPTS
      );
      graph.onZoom((zoomData) => throttled.invoke(zoomData));
    } else {
      graph.onZoom(null);
    }
  }

  // composable behaviors
  async onBehaviorsChange(): Promise<void> {
    const { behaviors, previousBehaviors } = this.model;

    for (const behavior of previousBehaviors) {
      behavior.updateRequested.disconnect(this.postUpdate, this);
    }

    for (const behavior of behaviors) {
      behavior.updateRequested.connect(this.postUpdate, this);
      behavior.graphDataUpdateRequested.connect(this.onGraphDataUpdateRequested, this);
      behavior.graphCameraUpdateRequested.connect(
        this.onGraphCameraUpdateRequested,
        this
      );
    }

    await this.postUpdate();
  }

  // link behaviors
  protected getLinkColor = (link: LinkObject): string => {
    return this.getComposedLinkAttr(
      link,
      ELinkBehaveMethod.getLinkColor,
      'getLinkColor',
      this.model.defaultLinkColor
    );
  };
  protected getLinkCurvature = (link: LinkObject): string => {
    return this.getComposedLinkAttr(
      link,
      ELinkBehaveMethod.getLinkCurvature,
      'getLinkCurvature',
      this.model.defaultLinkCurvature
    );
  };
  protected getLinkLineDash = (link: LinkObject): string => {
    return this.getComposedLinkAttr(
      link,
      ELinkBehaveMethod.getLinkLineDash,
      'getLinkLineDash',
      this.model.defaultLinkLineDash
    );
  };
  protected getLinkWidth = (link: LinkObject): string => {
    return this.getComposedLinkAttr(
      link,
      ELinkBehaveMethod.getLinkWidth,
      'getLinkWidth',
      this.model.defaultLinkWidth
    );
  };

  protected getLinkLabel = (link: LinkObject): string => {
    return this.getComposedLinkAttr(
      link,
      ELinkBehaveMethod.getLinkLabel,
      'getLinkLabel',
      ''
    );
  };

  protected getLinkDirectionalArrowColor = (link: LinkObject): string => {
    return this.getComposedLinkAttr(
      link,
      ELinkBehaveMethod.getLinkDirectionalArrowColor,
      'getLinkDirectionalArrowColor',
      ''
    );
  };

  protected getLinkDirectionalArrowLength = (link: LinkObject): string => {
    return this.castToNumber(
      this.getComposedLinkAttr(
        link,
        ELinkBehaveMethod.getLinkDirectionalArrowLength,
        'getLinkDirectionalArrowLength',
        ''
      )
    );
  };

  protected getLinkDirectionalArrowRelPos = (link: LinkObject): string => {
    return this.castToNumber(
      this.getComposedLinkAttr(
        link,
        ELinkBehaveMethod.getLinkDirectionalArrowRelPos,
        'getLinkDirectionalArrowRelPos',
        ''
      )
    );
  };

  protected getLinkDirectionalParticleColor = (link: LinkObject): string => {
    return this.getComposedLinkAttr(
      link,
      ELinkBehaveMethod.getLinkDirectionalParticleColor,
      'getLinkDirectionalParticleColor',
      ''
    );
  };

  protected getLinkDirectionalParticleSpeed = (link: LinkObject): string => {
    return this.castToNumber(
      this.getComposedLinkAttr(
        link,
        ELinkBehaveMethod.getLinkDirectionalParticleSpeed,
        'getLinkDirectionalParticleSpeed',
        ''
      )
    );
  };

  protected getLinkDirectionalParticleWidth = (link: LinkObject): string => {
    return this.castToNumber(
      this.getComposedLinkAttr(
        link,
        ELinkBehaveMethod.getLinkDirectionalParticleWidth,
        'getLinkDirectionalParticleWidth',
        ''
      )
    );
  };

  protected getLinkDirectionalParticles = (link: LinkObject): string => {
    return this.castToNumber(
      this.getComposedLinkAttr(
        link,
        ELinkBehaveMethod.getLinkDirectionalParticles,
        'getLinkDirectionalParticles',
        ''
      )
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
    methodIdx: ELinkBehaveMethod,
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

    for (const behavior of this._linkBehaviorsByMethod[methodIdx]) {
      let method = behavior[methodName] as any;
      value = method.call(behavior, options);
      if (value != null) {
        break;
      }
    }

    return value != null ? value : defaultValue;
  }

  // node behaviors
  protected getNodeColor = (node: NodeObject): string => {
    return this.getComposedNodeAttr(
      node,
      ENodeBehaveMethod.getNodeColor,
      'getNodeColor',
      this.model.defaultNodeColor
    );
  };

  protected getNodeLabel = (node: NodeObject): string => {
    return this.getComposedNodeAttr(
      node,
      ENodeBehaveMethod.getNodeLabel,
      'getNodeLabel',
      ''
    );
  };

  protected getNodeSize = (node: NodeObject): string => {
    return this.getComposedNodeAttr(
      node,
      ENodeBehaveMethod.getNodeSize,
      'getNodeSize',
      this.model.defaultNodeSize
    );
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

    for (const behavior of this._nodeBehaviorsByMethod[
      ENodeBehaveMethod.getNodeCanvasObject
    ]) {
      let method = behavior.getNodeCanvasObject;
      value = method.call(behavior, options);
      if (value != null) {
        break;
      }
    }
  };

  getComposedNodeAttr(
    node: NodeObject,
    methodIdx: ENodeBehaveMethod,
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

    for (const behavior of this._nodeBehaviorsByMethod[methodIdx]) {
      let method = behavior[methodName] as any;
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
    for (const behavior of this._nodeBehaviorsByMethod[ENodeBehaveMethod.onNodeClick]) {
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
    for (const behavior of this._linkBehaviorsByMethod[ELinkBehaveMethod.onLinkClick]) {
      shouldContinue = behavior.onLinkClick(options);
      if (!shouldContinue) {
        return;
      }
    }
  };

  protected onZoom = (zoom: IZoomData) => {
    const graph = zoom.graph || (this.graph as ForceGraphInstance);
    for (const behavior of this._graphBehaviorsByMethod[EGraphBehaveMethod.onZoom]) {
      behavior.onZoom({ ...zoom, graph });
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
    for (const behavior of this._graphBehaviorsByMethod[EGraphBehaveMethod.onRender]) {
      behavior.onRender(options);
    }
  };
}
