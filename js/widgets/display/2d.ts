/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type {
  ForceGraphGenericInstance,
  ForceGraphInstance,
  GraphData,
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
  EMOJI,
  EMPTY_GRAPH_DATA,
  IBehave,
  IHasGraph,
  ISource,
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
    };
  }

  get graphData(): GraphData {
    const source = this.get('source');
    return source ? source.graphData : EMPTY_GRAPH_DATA;
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
    iframe.onload = async (event: Event) => {
      const iframe = event.currentTarget as HTMLIFrameElement;
      const { contentWindow } = iframe;
      this.graph = (contentWindow as any).init();
      contentWindow.addEventListener('resize', this.onWindowResize);
      this._rendered.resolve(void 0);
      await this.update();
    };
    root.appendChild(iframe);
    this._iframe = iframe;
  }

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

  async postUpdate(): Promise<void> {
    const behaviors: IBehave[] = this.model.get('behaviors') || [];
    const promises: Promise<any>[] = [];
    for (const behavior of behaviors) {
      promises.push(behavior.onUpdate(this));
    }
    await Promise.all(promises);
  }

  async onBehaviorsChange(): Promise<void> {
    // TODO: disconnect old model...
    const behaviors: IBehave[] = this.model.get('behaviors') || [];
    const promises: Promise<any>[] = [];
    for (const behavior of behaviors) {
      behavior.updateRequested.connect(this.postUpdate, this);
      promises.push(behavior.onUpdate(this));
    }
    await Promise.all(promises);
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
}
