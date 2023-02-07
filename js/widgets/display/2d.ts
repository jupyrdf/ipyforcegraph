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
  ALL_LINK_METHODS,
  ALL_NODE_METHODS,
  CSS,
  DEBUG,
  DEFAULT_COLORS,
  EMOJI,
  EMPTY_GRAPH_DATA,
  EUpdate,
  IBehave,
  IHasGraph,
  ILinkBehaveOptions,
  INodeBehaveOptions,
  INodeEventBehaveOptions,
  IRenderOptions,
  ISource,
  TLinkBehaveMethod,
  TLinkMethodMap,
  TNodeBehaveMethod,
  TNodeMethodMap,
  TUpdateKind,
  WIDGET_DEFAULTS,
  emptyArray,
} from '../../tokens';
import { ForceBehaviorModel, GraphForcesBehaviorModel } from '../behaviors';

export class ForceGraphModel extends DOMWidgetModel {
  static model_name = 'ForceGraphModel';
  static serializers = {
    ...DOMWidgetModel.serializers,
    source: { deserialize },
    behaviors: { deserialize },
  };

  protected _nodeBehaviorsByMethod: TNodeMethodMap;
  protected _linkBehaviorsByMethod: TLinkMethodMap;
  protected _behaviorsChanged: Signal<ForceGraphModel, void>;

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: ForceGraphModel.model_name,
      _view_name: ForceGraphView.view_name,
      source: null,
      behaviors: [],
      default_node_color: DEFAULT_COLORS.node,
      default_link_color: DEFAULT_COLORS.link,
      background_color: DEFAULT_COLORS.background,
    };
  }

  initialize(attributes: ObjectHash, options: IBackboneModelOptions): void {
    super.initialize(attributes, options);
    this.on('change:behaviors', this.onBehaviorsChange, this);
    this.onBehaviorsChange();
  }

  onBehaviorsChange(): void {
    if (!this._behaviorsChanged) {
      this._behaviorsChanged = new Signal(this);
      this._linkBehaviorsByMethod = new Map();
      this._nodeBehaviorsByMethod = new Map();
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
    this._behaviorsChanged.emit(void 0);
  }

  linkBehaviorsForMethod(method: TLinkBehaveMethod): readonly IBehave[] {
    return this._linkBehaviorsByMethod.get(method) || emptyArray;
  }

  nodeBehaviorsForMethod(method: TNodeBehaveMethod): readonly IBehave[] {
    return this._nodeBehaviorsByMethod.get(method) || emptyArray;
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

  get defaultLinkColor(): string {
    return this.get('default_link_color') || DEFAULT_COLORS.link;
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
    this.model.on('change:background_color', this.onBackgroundColorChange, this);

    this.model.behaviorsChanged.connect(this.onBehaviorsChange, this);
    this.luminoWidget.disposed.connect(this.onDisposed, this);

    this.onSourceChange();
    this.onBehaviorsChange();
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

    const graph: ForceGraphInstance = (contentWindow as any).init();
    this.graph = graph as any;
    contentWindow.addEventListener('resize', this.onWindowResize);
    this._rendered.resolve(void 0);
    await this.onBackgroundColorChange();
    await this.update();
  };

  protected onWindowResize = () => {
    const { contentWindow } = this._iframe;
    const graph: ForceGraphInstance = this.graph as any;
    graph.width(contentWindow.innerWidth);
    graph.height(contentWindow.innerHeight);
  };

  protected async getJsUrl(): Promise<string> {
    return (
      await import(
        '!!file-loader!../../../node_modules/force-graph/dist/force-graph.js'
      )
    ).default as any;
  }

  protected get graphJsClass(): string {
    return 'ForceGraph';
  }

  protected async getIframeSource(): Promise<string> {
    let url = await this.getJsUrl();

    let src = `
      <head>
        <script src="${url}"></script>
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
            return ${this.graphJsClass}(args || {})(div);
          }
          window.wrapFunction = (fn) => {
            return (...args) => fn(...args);
          }
        </script>
      </body>
    `;
    return src;
  }

  async update(): Promise<void> {
    await this._rendered.promise;
    let { graphData } = this.model;
    DEBUG && console.warn(`${EMOJI} updating...`, graphData);
    (this.graph as any).graphData(graphData);
    await this.postUpdate();
  }

  wrapFunction(fn: Function) {
    return (this._iframe.contentWindow as any).wrapFunction(fn);
  }

  async onBackgroundColorChange() {
    await this.rendered;
    (this.graph as ForceGraphInstance).backgroundColor(this.model.backgroundColor);
  }

  onSourceChange(change?: any) {
    const { source, previousSource } = this;

    if (previousSource) {
      previousSource.dataUpdated.disconnect(this.update, this);
    }

    if (source) {
      source.dataUpdated.connect(this.update, this);
      this.update();
    }
  }

  protected async postUpdate(caller?: any, kind?: TUpdateKind): Promise<void> {
    await this.rendered;
    const graph = this.graph as ForceGraphInstance;
    if (!graph) {
      console.warn(`${EMOJI} no graph to postUpdate`);
      return;
    }
    // link
    graph.linkColor(this.wrapFunction(this.getLinkColor));
    graph.linkLabel(this.wrapFunction(this.getLinkLabel));

    graph.linkDirectionalArrowColor(
      this.wrapFunction(this.getLinkDirectionalArrowColor)
    );
    graph.linkDirectionalArrowLength(
      this.wrapFunction(this.getLinkDirectionalArrowLength)
    );
    graph.linkDirectionalArrowRelPos(
      this.wrapFunction(this.getLinkDirectionalArrowRelPos)
    );
    graph.linkDirectionalParticleColor(
      this.wrapFunction(this.getLinkDirectionalParticleColor)
    );
    graph.linkDirectionalParticleSpeed(
      this.wrapFunction(this.getLinkDirectionalParticleSpeed)
    );
    graph.linkDirectionalParticleWidth(
      this.wrapFunction(this.getLinkDirectionalParticleWidth)
    );
    graph.linkDirectionalParticles(this.wrapFunction(this.getLinkDirectionalParticles));

    // node
    graph.nodeColor(this.wrapFunction(this.getNodeColor));
    graph.nodeLabel(this.wrapFunction(this.getNodeLabel));

    // evented
    graph.onNodeClick(this.wrapFunction(this.onNodeClick));

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
    for (let simBehavior of this.getGraphForcesBehaviors()) {
      const { warmupTicks, cooldownTicks, alphaDecay, alphaMin, velocityDecay } =
        simBehavior;
      graph.cooldownTicks(cooldownTicks);
      graph.warmupTicks(warmupTicks);
      graph.d3AlphaDecay(alphaDecay);
      graph.d3AlphaMin(alphaMin);
      graph.d3VelocityDecay(velocityDecay);

      for (let key in simBehavior.forces) {
        let behavior: ForceBehaviorModel | null = simBehavior.forces[key];
        let force = behavior?.force || null;
        graph.d3Force(key, force);
      }
    }
  }

  protected getOnRenderPostUpdate() {
    const graph = this.graph as ForceGraphInstance;
    graph.onRenderFramePost(this.wrapFunction(this.onRender));
  }

  // composable behaviors
  async onBehaviorsChange(): Promise<void> {
    const { behaviors, previousBehaviors } = this.model;

    for (const previous of previousBehaviors) {
      if (!behaviors.includes(previous)) {
        previous.updateRequested.disconnect(this.postUpdate, this);
      }
    }

    for (const behavior of behaviors) {
      if (!previousBehaviors.includes(behavior)) {
        behavior.updateRequested.connect(this.postUpdate, this);
      }
    }

    await this.update();
  }

  // link behaviors
  protected getLinkColor = (link: LinkObject): string => {
    return this.getComposedLinkAttr(link, 'getLinkColor', this.model.defaultLinkColor);
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
    const { behaviors } = this.model;
    const graphData = (this.graph as ForceGraphInstance).graphData();
    let shouldContinue = true;
    const options: INodeEventBehaveOptions = {
      view: this,
      graphData,
      event,
      node,
    };
    for (const behavior of behaviors) {
      if (!behavior.onNodeClick) {
        continue;
      }
      shouldContinue = behavior.onNodeClick(options);
      if (!shouldContinue) {
        return;
      }
    }
  };

  protected updateRenderOptions(options: IRenderOptions): IRenderOptions {
    return options;
  }

  protected onRender = (ctx: CanvasRenderingContext2D, globalScale: any) => {
    const { behaviors } = this.model;
    const graphData = (this.graph as ForceGraphInstance).graphData();
    let options: IRenderOptions = {
      view: this,
      graphData,
      context2d: ctx,
      globalScale,
    };
    options = this.updateRenderOptions(options);
    for (const behavior of behaviors) {
      if (!behavior.onRender) {
        continue;
      }
      behavior.onRender(options);
    }
  };

  protected *getGraphForcesBehaviors(): Generator<GraphForcesBehaviorModel> {
    const { behaviors } = this.model;
    for (let behavior of behaviors) {
      if (behavior instanceof GraphForcesBehaviorModel) {
        yield behavior;
      }
    }
    return;
  }
}
