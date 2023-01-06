/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { NodeObject } from 'force-graph';

import { WidgetModel, unpack_models as deserialize } from '@jupyter-widgets/base';

import { IHasGraph, WIDGET_DEFAULTS } from '../../tokens';

import { BehaviorModel } from './base';

export class NodeLabelModel extends BehaviorModel {
  static model_name = 'NodeLabelModel';
  static serializers = {
    ...WidgetModel.serializers,
    value: { deserialize },
  };

  protected _graph: IHasGraph | null = null;

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: NodeLabelModel.model_name,
      column_name: null,
      default_label: null,
    };
  }

  get columnName(): string | null {
    let columnName = this.get('column_name');
    if (columnName == null && this._graph) {
      try {
        columnName = (this._graph.source as any).get('node_id_column');
      } catch (err) {
        console.error('failed to fetch id column', err);
      }
    }
    return columnName || null;
  }

  get defaultLabel(): string | null {
    return this.get('default_label') || null;
  }

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);
    this.on('change:column_name', this.onColumnNameChange, this);
  }

  onColumnNameChange(change?: any) {
    this._updateRequested.emit(void 0);
  }

  async registerGraph(hasGraph: IHasGraph): Promise<void> {
    this._graph = hasGraph;
    await hasGraph.rendered;
  }

  async onUpdate(hasGraph: IHasGraph): Promise<void> {
    if (hasGraph !== this._graph) {
      await this.registerGraph(hasGraph);
    }

    const { columnName, defaultLabel } = this;

    hasGraph.graph.nodeLabel((node: NodeObject) => {
      let label = null;
      if (columnName != null) {
        label = node[columnName];
      }
      return label == null ? defaultLabel : label;
    });
  }
}
