import { GraphData } from 'force-graph';
import type ndarray from 'ndarray';

import { ISignal, Signal } from '@lumino/signaling';

import { WidgetModel, unpack_models as deserialize } from '@jupyter-widgets/base';

import { DEBUG, EMOJI, WIDGET_DEFAULTS } from '../tokens';

/**
 * A model which wraps a number of `ndarray.NdArray` to describe a graph.
 */
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
      ...WIDGET_DEFAULTS,
      _model_name: SourceModel.model_name,
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
