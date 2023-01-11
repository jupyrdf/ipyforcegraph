/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { GraphData } from 'force-graph';

import { ISignal, Signal } from '@lumino/signaling';

import { WidgetModel } from '@jupyter-widgets/base';

import { DEFAULT_COLUMNS, EMPTY_GRAPH_DATA, WIDGET_DEFAULTS } from '../../tokens';
import { jsonToDataFrame } from '../serializers';

const emptyArray = Object.freeze([]);

export class DataFrameSourceModel extends WidgetModel {
  static model_name = 'DataFrameSourceModel';
  static serializers = {
    ...WidgetModel.serializers,
    nodes: { deserialize: jsonToDataFrame },
    links: { deserialize: jsonToDataFrame },
  };

  protected _dataUpdated: Signal<DataFrameSourceModel, void> = new Signal(this);
  protected _graphData: GraphData | null = null;
  protected _graphDataRequested = false;

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: DataFrameSourceModel.model_name,
      nodes: null,
      links: null,
      node_id_column: DEFAULT_COLUMNS.id,
      link_source_column: DEFAULT_COLUMNS.source,
      link_target_column: DEFAULT_COLUMNS.target,
    };
  }

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);

    this.on('change:nodes', this.graphUpdate, this);
    this.on('change:links', this.graphUpdate, this);
  }

  get dataUpdated(): ISignal<DataFrameSourceModel, void> {
    return this._dataUpdated;
  }

  get nodeIdColumn() {
    return this.get('node_id_column') || DEFAULT_COLUMNS.id;
  }

  get linkSourceColumn() {
    return this.get('link_source_column') || DEFAULT_COLUMNS.source;
  }

  get linkTargetColumn() {
    return this.get('link_target_column') || DEFAULT_COLUMNS.target;
  }

  get nodes() {
    return this.get('nodes') || emptyArray;
  }

  get links() {
    return this.get('links') || emptyArray;
  }

  get graphData(): GraphData {
    if (!this._graphDataRequested) {
      this.graphUpdate();
      this._graphDataRequested = true;
    }
    return this._graphData || EMPTY_GRAPH_DATA;
  }

  set graphData(graphData: GraphData) {
    this._graphData = graphData;
    this._dataUpdated.emit(void 0);
  }

  protected graphUpdate() {
    const graphData: GraphData = { nodes: [], links: [] };

    const { nodes, links, nodeIdColumn, linkSourceColumn, linkTargetColumn } = this;

    const nodeColumns = Object.keys(nodes);
    const linkColumns = Object.keys(links);

    const nodeCount = (nodes[nodeIdColumn] || emptyArray).length;
    const linkCount = (links[linkSourceColumn] || emptyArray).length;

    const hasIdColumn = nodes[nodeIdColumn] != null;

    for (let idx = 0; idx < nodeCount; idx++) {
      let node = { id: hasIdColumn ? nodes[nodeIdColumn][idx] : idx };
      for (const col of nodeColumns) {
        node[col] = nodes[col][idx];
      }
      graphData.nodes.push(node);
    }

    for (let idx = 0; idx < linkCount; idx++) {
      let link = {
        source: links[linkSourceColumn][idx],
        target: links[linkTargetColumn][idx],
      };
      for (const col of linkColumns) {
        link[col] = links[col][idx];
      }
      graphData.links.push(link);
    }

    this.graphData = graphData;
  }
}
