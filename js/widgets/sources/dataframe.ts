/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { GraphData } from 'force-graph';

import { ISignal, Signal } from '@lumino/signaling';

import { IBackboneModelOptions, WidgetModel } from '@jupyter-widgets/base';

import {
  DEFAULT_COLUMNS,
  EMPTY_GRAPH_DATA,
  WIDGET_DEFAULTS,
  emptyArray,
} from '../../tokens';
import { dataframe_serialization } from '../serializers';

export class DataFrameSourceModel extends WidgetModel {
  static model_name = 'DataFrameSourceModel';
  static serializers = {
    ...WidgetModel.serializers,
    nodes: dataframe_serialization,
    links: dataframe_serialization,
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

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
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

  setFromGraphData(graphData: GraphData) {
    const { nodes, links } = graphData;

    let nodeCount = nodes.length;
    let linkCount = links.length;

    let nodeRecords: Record<string, any[]> = {};
    let linkRecords: Record<string, any[]> = {};

    let i: number;
    let colName: string;
    let col: any[];
    let value: any;

    const { nodeIdColumn, linkSourceColumn, linkTargetColumn } = this;

    if (nodeCount) {
      for (colName of Object.keys(nodes[0])) {
        col = nodeRecords[colName] = new Array(nodeCount);
        i = 0;
        while (i < nodeCount) {
          col[i] = nodes[i][colName];
          i++;
        }
      }
    }

    if (linkCount) {
      for (colName of Object.keys(links[0])) {
        col = linkRecords[colName] = new Array(nodeCount);
        i = 0;
        while (i < linkCount) {
          value = links[i][colName];

          switch (colName) {
            case linkTargetColumn:
            case linkSourceColumn:
              value = value[nodeIdColumn];
              break;
            default:
              break;
          }

          col[i] = value;
          i++;
        }
      }
    }

    this.set({ nodes: nodeRecords, links: linkRecords });
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
