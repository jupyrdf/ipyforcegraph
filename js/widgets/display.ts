import ForceGraph from 'force-graph';
import { ForceGraphInstance, GraphData } from 'force-graph';

import { PromiseDelegate } from '@lumino/coreutils';

import {
  DOMWidgetModel,
  DOMWidgetView,
  unpack_models as deserialize,
} from '@jupyter-widgets/base';

import { DEBUG, EMOJI, EMPTY_GRAPH_DATA, WIDGET_DEFAULTS } from '../tokens';

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

export class ForceGraphView extends DOMWidgetView {
  static view_name = 'ForceGraphView';
  graph: ForceGraphInstance;
  model: ForceGraphModel;

  protected _rendered: PromiseDelegate<void>;

  initialize(parameters: any) {
    super.initialize(parameters);
    this._rendered = new PromiseDelegate();
    this.model.on('change:source', this.onSourceChange, this);
    this.onSourceChange();
  }

  onSourceChange(change?: any) {
    // TODO disconnect old model...
    let source = this.model.get('source');
    if (source) {
      source.dataUpdated.connect(this.update, this);
      this.update();
    }
  }

  async update(): Promise<void> {
    await this._rendered.promise;
    let { graphData } = this.model;
    DEBUG && console.warn(`${EMOJI} updating...`, graphData);
    this.graph.graphData(graphData);
  }

  async render(): Promise<void> {
    const root = this.el as HTMLDivElement;
    const containerDiv = document.createElement('div');
    root.appendChild(containerDiv);
    this.graph = ForceGraph()(containerDiv);
    this._rendered.resolve(void 0);
    await this.update();
  }
}
