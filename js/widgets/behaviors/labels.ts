/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
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
      column_name: 'label',
    };
  }

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);
    this.on('change:column_name', this.onColumnNameChange, this);
  }

  onColumnNameChange(change?: any) {
    this._updateRequested.emit(void 0);
  }

  registerGraph(hasGraph: IHasGraph): void {
    this._graph = hasGraph;
  }

  onUpdate(hasGraph: IHasGraph) {
    if (hasGraph !== this._graph) {
      this.registerGraph(hasGraph);
    }

    hasGraph.graph.nodeLabel(this.get('column_name'));
  }
}
