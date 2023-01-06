/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { GraphData } from 'force-graph';

import { ISignal, Signal } from '@lumino/signaling';

import { WidgetModel } from '@jupyter-widgets/base';

import { WIDGET_DEFAULTS } from '../../tokens';
import { jsonToDataFrame } from '../serializers';

const emptyArray = Object.freeze([]);

export class DataFrameSourceModel extends WidgetModel {
  static model_name = 'DataFrameSourceModel';
  static serializers = {
    ...WidgetModel.serializers,
    nodes: { deserialize: jsonToDataFrame },
    links: { deserialize: jsonToDataFrame },
  };

  protected _dataUpdated: Signal<DataFrameSourceModel, void>;

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: DataFrameSourceModel.model_name,
      nodes: null,
      links: null,
      node_id_column: 'index',
      link_source_column: 'source',
      link_target_column: 'target',
    };
  }

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);
    this._dataUpdated = new Signal(this);

    this.on('change:nodes', this.graphUpdate, this);
    this.on('change:links', this.graphUpdate, this);

    this.graphUpdate();
  }

  get dataUpdated(): ISignal<DataFrameSourceModel, void> {
    return this._dataUpdated;
  }

  get graphData(): GraphData {
    const graph: GraphData = {
      nodes: [],
      links: [],
    };

    const nodes = this.get('nodes');
    const links = this.get('links');
    const nodeIdColumn = this.get('node_id_column');
    const sourceColumn = this.get('link_source_column');
    const targetColumn = this.get('link_target_column');

    const nodeColumns = Object.keys(nodes);

    const nodeCount = (nodes[nodeColumns[0]] || emptyArray).length;
    const linkCount = (links[sourceColumn] || emptyArray).length;

    const indeces = nodes[nodeColumns[nodeIdColumn]] || [...Array(nodeCount).keys()];

    for (let id = 0; id < nodeCount; id++) {
      let node = { id: indeces[id] };
      for (const col of nodeColumns) {
        node[col] = nodes[col][id];
      }
      graph.nodes.push(node);
    }

    for (let id = 0; id < linkCount; id++) {
      graph.links.push({
        source: links[sourceColumn][id],
        target: links[targetColumn][id],
      });
    }

    return graph;
  }

  graphUpdate(change?: any) {
    //TODO throttle / debounce emitting events
    this._dataUpdated.emit(void 0);
  }
}
