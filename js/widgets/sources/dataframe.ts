/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type { GraphData, LinkObject, NodeObject } from 'force-graph';

import { ISignal, Signal } from '@lumino/signaling';

import { IBackboneModelOptions, WidgetModel } from '@jupyter-widgets/base';

import {
  DEFAULT_COLUMNS,
  EMPTY_GRAPH_DATA,
  IExtraColumns,
  IPreservedColumns,
  WIDGET_DEFAULTS,
  emptyArray,
  emptyPreservedColumns,
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
      link_id_column: DEFAULT_COLUMNS.id,
      link_source_column: DEFAULT_COLUMNS.source,
      link_target_column: DEFAULT_COLUMNS.target,
      node_preserve_columns: [],
    };
  }

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on('change:nodes change:links', this.graphUpdate, this);
  }

  get dataUpdated(): ISignal<DataFrameSourceModel, void> {
    return this._dataUpdated;
  }

  get nodeIdColumn() {
    return this.get('node_id_column') || DEFAULT_COLUMNS.id;
  }

  get linkIdColumn() {
    return this.get('link_id_column') || DEFAULT_COLUMNS.id;
  }

  get linkSourceColumn() {
    return this.get('link_source_column') || DEFAULT_COLUMNS.source;
  }

  get linkTargetColumn() {
    return this.get('link_target_column') || DEFAULT_COLUMNS.target;
  }

  get preservedColumns(): IPreservedColumns {
    const nodes = this.get('node_preserve_columns') || emptyArray;
    const links = this.get('link_preserve_columns') || emptyArray;

    if (!nodes.length && !links.length) {
      return emptyPreservedColumns;
    }

    return { nodes, links };
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

  allColumns(obj: NodeObject | LinkObject, extraColumns: string[]) {
    let allColumns = [...Object.keys(obj)];
    for (const extraColumn of extraColumns) {
      if (!allColumns.includes(extraColumn)) {
        allColumns.push(extraColumn);
      }
    }
    return allColumns;
  }

  setFromGraphData(graphData: GraphData, extraColumns: IExtraColumns) {
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
      for (colName of this.allColumns(nodes[0], extraColumns.nodes)) {
        col = nodeRecords[colName] = new Array(nodeCount);
        i = 0;
        while (i < nodeCount) {
          col[i] = nodes[i][colName];
          i++;
        }
      }
    }

    if (linkCount) {
      for (colName of this.allColumns(links[0], extraColumns.links)) {
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

    const { nodes, links, linkIdColumn, nodeIdColumn } = this;

    const nodeColumns = Object.keys(nodes);
    const linkColumns = Object.keys(links);

    const nodesById: Record<string | number, NodeObject> = {};

    const nodeCount = (nodes[nodeIdColumn] || emptyArray).length;
    const linkCount = (links[linkIdColumn] || emptyArray).length;

    const hasNodeIdColumn = nodes[nodeIdColumn] != null;
    const hasLinkIdColumn = nodes[linkIdColumn] != null;

    for (let idx = 0; idx < nodeCount; idx++) {
      const id = hasNodeIdColumn ? nodes[nodeIdColumn][idx] : idx;
      const node = { id };
      nodesById[id] = node;
      for (const col of nodeColumns) {
        switch (col) {
          case nodeIdColumn:
            continue;
          default:
            node[col] = nodes[col][idx];
            break;
        }
      }
      graphData.nodes.push(node);
    }

    for (let idx = 0; idx < linkCount; idx++) {
      const id = hasLinkIdColumn ? links[linkIdColumn][idx] : idx;
      let link = {
        id,
      };
      for (const col of linkColumns) {
        switch (col) {
          case linkIdColumn:
            continue;
          default:
            link[col] = links[col][idx];
            break;
        }
      }
      graphData.links.push(link as LinkObject);
    }

    this.graphData = graphData;
  }

  /** merge the new nodes on top of the old nodes */
  mergePreserved(
    newGraphData: GraphData,
    oldGraphData: GraphData,
    preservedColumns: IPreservedColumns
  ): GraphData | null {
    const { nodeIdColumn, linkIdColumn, linkSourceColumn, linkTargetColumn } = this;
    const newNodes: Record<string | number, NodeObject> = {};
    const oldNodes: Record<string | number, NodeObject> = {};
    const newLinks: Record<string | number, LinkObject> = {};
    const oldLinks: Record<string | number, LinkObject> = {};
    const oldNodeCount = oldGraphData.nodes.length;
    const oldLinkCount = oldGraphData.links.length;

    let deletedLinks: number[] = [];
    let deletedNodes: number[] = [];

    // gather new nodes
    for (const newNode of newGraphData.nodes) {
      newNodes[newNode[nodeIdColumn]] = newNode;
    }

    // gather new links
    for (const newLink of newGraphData.links) {
      newLinks[newLink[linkIdColumn]] = newLink;
    }

    // update nodes in-place
    let idx = -1;
    for (const oldNode of oldGraphData.nodes) {
      idx++;
      const nodeId = oldNode[nodeIdColumn];
      const newNode = newNodes[nodeId];
      if (newNode == null) {
        deletedNodes.push(idx);
        continue;
      }
      for (const [column, value] of Object.entries(newNode)) {
        if (
          value != null &&
          !preservedColumns.nodes.includes(column) &&
          column !== nodeIdColumn
        ) {
          oldNode[column] = value;
        }
      }
      oldNodes[nodeId] = oldNode;
    }

    // delete removed nodes
    let delIdx = deletedNodes.length;
    while (delIdx) {
      oldGraphData.nodes.splice(deletedNodes[delIdx], 1);
      delIdx--;
    }

    // add missing nodes
    for (const [nid, newNode] of Object.entries(newNodes)) {
      if (!oldNodes[nid]) {
        oldNodes[nid] = newNode;
        oldGraphData.nodes.push(newNode);
      }
    }

    idx = -1;

    // update links in-place
    for (const oldLink of oldGraphData.links) {
      idx++;
      const linkId = oldLink[linkIdColumn];
      const newLink = newLinks[linkId];
      if (newLink == null) {
        deletedLinks.push(idx);
        continue;
      }
      for (const [column, value] of Object.entries(newLink)) {
        if (value != null && !preservedColumns.links.includes(column)) {
          switch (column) {
            case linkIdColumn:
              break;
            case linkSourceColumn:
            case linkTargetColumn:
              switch (typeof value) {
                case 'object':
                  oldLink[column] = value;
                  break;
                default:
                  oldLink[column] = oldNodes[value];
                  break;
              }
              break;
            default:
              oldLink[column] = value;
          }
        }
      }
      oldLinks[linkId] = oldLink;
    }

    // delete removed nodes
    delIdx = deletedLinks.length;
    while (delIdx) {
      oldGraphData.links.splice(deletedLinks[delIdx], 1);
      delIdx--;
    }

    // add missing links
    for (const [lid, newLink] of Object.entries(newLinks)) {
      if (!oldLinks[lid]) {
        oldGraphData.links.push(newLink);
      }
    }

    if (
      oldLinkCount !== oldGraphData.links.length ||
      oldNodeCount !== oldGraphData.nodes.length
    ) {
      // unserialize links
      for (const link of oldGraphData.links) {
        link.source = typeof link.source == 'object' ? link.source.id : link.source;
        link.target = typeof link.target == 'object' ? link.target.id : link.target;
      }

      return oldGraphData;
    }
  }
}
