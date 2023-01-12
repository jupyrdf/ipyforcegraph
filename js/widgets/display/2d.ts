/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type {
  ForceGraphGenericInstance,
  ForceGraphInstance,
  GraphData,
  LinkObject,
  NodeObject,
} from 'force-graph';

import { PromiseDelegate } from '@lumino/coreutils';

import {
  DOMWidgetModel,
  DOMWidgetView,
  unpack_models as deserialize,
} from '@jupyter-widgets/base';

import {
  CSS,
  DEBUG,
  DEFAULT_COLORS,
  EMOJI,
  EMPTY_GRAPH_DATA,
  IBehave,
  IHasGraph,
  ILinkBehaveOptions,
  INodeBehaveOptions,
  INodeEventBehaveOptions,
  ISource,
  TLinkBehaveMethod,
  TNodeBehaveMethod,
  WIDGET_DEFAULTS,
} from '../../tokens';

export class ForceGraphModel extends DOMWidgetModel {
  static model_name = 'ForceGraphModel';
  static serializers = {
    ...DOMWidgetModel.serializers,
    source: { deserialize },
    behaviors: { deserialize },
  };

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: ForceGraphModel.model_name,
      _view_name: ForceGraphView.view_name,
      source: null,
      behaviors: [],
      default_node_color: DEFAULT_COLORS.node,
      default_edge_color: DEFAULT_COLORS.link,
    };
  }

  get graphData(): GraphData {
    const source = this.get('source');
    return source ? source.graphData : EMPTY_GRAPH_DATA;
  }

  get behaviors(): IBehave[] {
    return this.get('behaviors') || [];
  }

  get defaultNodeColor(): string {
    return this.get('default_node_color') || DEFAULT_COLORS.node;
  }

  get defaultLinkColor(): string {
    return this.get('default_link_color') || DEFAULT_COLORS.link;
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

  get rendered(): Promise<void> {
    return this._rendered.promise;
  }

  initialize(parameters: any) {
    super.initialize(parameters);
    this.luminoWidget.addClass(CSS.widget);
    this.luminoWidget.addClass(`${CSS.widget}-${this.graphJsClass}`);
    this._rendered = new PromiseDelegate();
    this.model.on('change:source', this.onSourceChange, this);
    this.model.on('change:behaviors', this.onBehaviorsChange, this);
    this.onSourceChange();
    this.onBehaviorsChange();
    this.luminoWidget.disposed.connect(this.onDisposed, this);
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
    await this.update();
  };

  protected onWindowResize = () => {
    const { contentWindow } = this._iframe;
    const graph: ForceGraphInstance = this.graph as any;
    graph.width(contentWindow.innerWidth);
    graph.height(contentWindow.innerHeight);
  };

  protected async getJsUrl() {
    return (await import('!!file-loader!force-graph/dist/force-graph.js')).default;
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
          window.init = () => {
            const div = document.createElement('div');
            document.body.appendChild(div);
            return ${this.graphJsClass}()(div);
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

  onSourceChange(change?: any) {
    // TODO disconnect old model...
    let source = this.model.get('source');
    if (source) {
      source.dataUpdated.connect(this.update, this);
      this.update();
    }
  }

  protected async postUpdate(): Promise<void> {
    await this.rendered;
    const graph = this.graph as ForceGraphInstance;
    if (graph) {
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
      graph.linkDirectionalParticles(
        this.wrapFunction(this.getLinkDirectionalParticles)
      );

      // node
      graph.nodeColor(this.wrapFunction(this.getNodeColor));
      graph.nodeLabel(this.wrapFunction(this.getNodeLabel));

      // evented
      graph.onNodeClick(this.wrapFunction(this.onNodeClick));
    } else {
      console.warn(`${EMOJI} no graph to postUpdate`);
    }
  }

  // composable behaviors
  async onBehaviorsChange(): Promise<void> {
    // TODO: disconnect old model...
    const behaviors: IBehave[] = this.model.behaviors;
    for (const behavior of behaviors) {
      behavior.updateRequested.connect(this.postUpdate, this);
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
    const { behaviors } = this.model;
    let value: string | null;
    const graphData = (this.graph as ForceGraphInstance).graphData();
    const options: ILinkBehaveOptions = {
      view: this,
      graphData,
      link,
    };

    for (const behavior of behaviors) {
      let method = behavior[methodName];
      if (!method) {
        continue;
      }
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
    const { behaviors } = this.model;
    let value: string | null;
    const graphData = (this.graph as ForceGraphInstance).graphData();
    const options: INodeBehaveOptions = {
      view: this,
      graphData,
      node,
    };

    for (const behavior of behaviors) {
      let method = behavior[methodName];
      if (!method) {
        continue;
      }
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
}
