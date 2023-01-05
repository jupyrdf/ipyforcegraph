/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { WidgetModel, unpack_models as deserialize } from '@jupyter-widgets/base';

import { IHasGraph, WIDGET_DEFAULTS } from '../../tokens';

import { BehaviorModel } from './base';

export class NodeSelectionModel extends BehaviorModel {
  static model_name = 'NodeSelectionModel';
  static serializers = {
    ...WidgetModel.serializers,
    value: { deserialize },
  };

  protected _graph: IHasGraph | null = null;

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: NodeSelectionModel.model_name,
      selected: [],
      multiple: true,
    };
  }

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);
    this.on('change:selected', this.onValueChange, this);
    this.onValueChange();
  }

  onValueChange(change?: any) {
    this._updateRequested.emit(void 0);
  }

  get selected(): Set<number> {
    return new Set<number>([...(this.get('selected') || [])]);
  }

  set selected(selected: Set<number>) {
    this.set({ selected: [...selected] });
    this.save_changes();
  }

  get selectedColor(): string {
    return this.get('selected_color');
  }

  get notSelectedColor(): string {
    return this.get('not_selected_color');
  }

  registerGraph(hasGraph: IHasGraph): void {
    this._graph = hasGraph;
    hasGraph.graph.onNodeClick((node, event) => {
      let { selected } = this;
      const id = node.id as number;
      if (this.get('multiple') && (event.ctrlKey || event.shiftKey || event.altKey)) {
        selected.has(id) ? selected.delete(id) : selected.add(id);
      } else {
        selected.clear();
        selected.add(id);
      }

      this.selected = selected;
    });
  }

  onUpdate(hasGraph: IHasGraph) {
    if (hasGraph !== this._graph) {
      this.registerGraph(hasGraph);
    }

    const { selected, selectedColor, notSelectedColor } = this;

    hasGraph.graph.nodeColor((node) => {
      return selected.has(node.id as number) ? selectedColor : notSelectedColor;
    });
  }
}
