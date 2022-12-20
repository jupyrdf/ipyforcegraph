// import { Signal } from '@lumino/signaling';
import ForceGraph from 'force-graph';
import { ForceGraphInstance, GraphData } from 'force-graph';
import * as ndarray from 'ndarray';

import { PromiseDelegate } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';

import {
  DOMWidgetModel,
  DOMWidgetView,
  WidgetModel,
  unpack_models as deserialize,
} from '@jupyter-widgets/base';

import { DEBUG, EMOJI, NAME, VERSION } from './tokens';

const EMPTY_GRAPH_DATA: GraphData = Object.freeze({
  links: [],
  nodes: [],
});

export class SourceModel extends WidgetModel {
  static model_name = 'SourceModel';
  static serializers = {
    ...WidgetModel.serializers,
    nodes: { deserialize },
    links: { deserialize },
    metadata: { deserialize },
  };

  protected _dataUpdated: Signal<SourceModel, void>;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: SourceModel.model_name,
      _model_module_version: VERSION,
      _view_module: NAME,
      nodes: null,
      links: null,
      metadata: null,
    };
  }

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);
    this._dataUpdated = new Signal(this);

    this.on('change:nodes', this.onNodesChange, this);
    this.on('change:links', this.onLinksChange, this);
    this.on('change:metadata', this.onMetadataChange, this);

    this.onNodesChange();
    this.onLinksChange();
    this.onMetadataChange();
    this.graphUpdate();
  }

  get dataUpdated(): ISignal<SourceModel, void> {
    return this._dataUpdated;
  }

  get graphData(): GraphData {
    const n: ndarray.NdArray = this.get('nodes')?.get('array');
    const l: ndarray.NdArray = this.get('links')?.get('array');
    // const m: ndarray.NdArray = this.get('metadata')?.get('array');
    const g: GraphData = {
      nodes: [],
      links: [],
    };

    if (n && n.shape[0]) {
      for (let i = 0; i < n.shape[0]; ++i) {
        g.nodes[i] = { id: i };
      }
    }

    if (l && l.shape[0]) {
      for (let i = 0; i < l.shape[0]; ++i) {
        g.links.push({ source: l.get(i, 0), target: l.get(i, 1) });
      }
    }

    DEBUG && console.warn(`${EMOJI} updating...`, g);

    return g;
  }

  onNodesChange(change?: any) {
    let nodes = this.get('nodes');
    if (nodes) {
      nodes.on('change:array', this.graphUpdate, this);
    }
  }

  onLinksChange(change?: any) {
    let links = this.get('links');
    if (links) {
      links.on('change:array', this.graphUpdate, this);
    }
  }

  onMetadataChange(change?: any) {
    let metadata = this.get('metadata');
    if (metadata) {
      metadata.on('change:array', this.graphUpdate, this);
    }
  }

  graphUpdate(change?: any) {
    //TODO throttle / debounce emitting events
    this._dataUpdated.emit(void 0);
  }
}

export class ForceGraphModel extends DOMWidgetModel {
  static model_name = 'ForceGraphModel';
  static serializers = {
    ...DOMWidgetModel.serializers,
    source: { deserialize },
  };

  defaults() {
    return {
      ...super.defaults(),
      _model_name: ForceGraphModel.model_name,
      _model_module_version: VERSION,
      _view_module: NAME,
      _view_name: ForceGraphView.view_name,
      _view_module_version: VERSION,
      source: null,
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
