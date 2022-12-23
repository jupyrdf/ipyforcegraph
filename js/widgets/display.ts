/*
 * Copyright (c) 2022 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import ForceGraph3D from '3d-force-graph';
import { ForceGraph3DInstance } from '3d-force-graph';
import ForceGraph from 'force-graph';
import { ForceGraphInstance, GraphData } from 'force-graph';

import { PromiseDelegate } from '@lumino/coreutils';

import {
  DOMWidgetModel,
  DOMWidgetView,
  unpack_models as deserialize,
} from '@jupyter-widgets/base';

import {
  DEBUG,
  EMOJI,
  EMPTY_GRAPH_DATA,
  IBehave,
  IHasGraph,
  ISource,
  WIDGET_DEFAULTS,
} from '../tokens';

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

export class ForceGraphView extends DOMWidgetView implements IHasGraph {
  static view_name = 'ForceGraphView';
  graph: ForceGraphInstance;
  model: ForceGraphModel;

  protected _rendered: PromiseDelegate<void>;

  get source(): ISource {
    return this.model.get('source');
  }

  initialize(parameters: any) {
    super.initialize(parameters);
    this._rendered = new PromiseDelegate();
    this.model.on('change:source', this.onSourceChange, this);
    this.model.on('change:behaviors', this.onBehaviorsChange, this);
    this.onSourceChange();
    this.onBehaviorsChange();
  }

  async render(): Promise<void> {
    const root = this.el as HTMLDivElement;
    const containerDiv = document.createElement('div');
    root.appendChild(containerDiv);
    this.graph = ForceGraph()(containerDiv);
    this._rendered.resolve(void 0);
    await this.update();
  }

  async update(): Promise<void> {
    await this._rendered.promise;
    let { graphData } = this.model;
    DEBUG && console.warn(`${EMOJI} updating...`, graphData);
    this.graph.graphData(graphData);
    await this.postUpdate();
  }

  async postUpdate(): Promise<void> {
    const behaviors: IBehave[] = this.model.get('behaviors') || [];
    for (const behavior of behaviors) {
      behavior.onUpdate(this);
    }
  }

  onBehaviorsChange() {
    const behaviors: IBehave[] = this.model.get('behaviors') || [];
    for (const behavior of behaviors) {
      behavior.updateRequested.connect(this.postUpdate, this);
    }
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

export class ForceGraph3DModel extends DOMWidgetModel {
  static model_name = 'ForceGraph3DModel';
  static serializers = {
    ...DOMWidgetModel.serializers,
    source: { deserialize },
  };

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: ForceGraph3DModel.model_name,
      _view_name: ForceGraph3DView.view_name,
      source: null,
    };
  }

  get graphData(): GraphData {
    const source = this.get('source');
    return source ? source.graphData : EMPTY_GRAPH_DATA;
  }
}

export class ForceGraph3DView extends DOMWidgetView {
  static view_name = 'ForceGraph3DView';
  graph: ForceGraph3DInstance;
  model: ForceGraph3DModel;

  protected _rendered: PromiseDelegate<void>;

  get source(): ISource {
    return this.model.get('source');
  }

  initialize(parameters: any) {
    super.initialize(parameters);
    this._rendered = new PromiseDelegate();
    this.model.on('change:source', this.onSourceChange, this);
    this.onSourceChange();
  }

  async render(): Promise<void> {
    const root = this.el as HTMLDivElement;
    const containerDiv = document.createElement('div');
    root.appendChild(containerDiv);
    this.graph = ForceGraph3D()(containerDiv);
    this._rendered.resolve(void 0);
    await this.update();
  }

  async update(): Promise<void> {
    await this._rendered.promise;
    let { graphData } = this.model;
    DEBUG && console.warn(`${EMOJI} updating...`, graphData);
    this.graph.graphData(graphData);
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
