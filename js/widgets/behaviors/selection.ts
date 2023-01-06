/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type { NodeObject } from 'force-graph';

import { WidgetModel, unpack_models as deserialize } from '@jupyter-widgets/base';

import { DEFAULT_COLORS, IHasGraph, WIDGET_DEFAULTS } from '../../tokens';

import { BehaviorModel } from './base';

export type TSelectedSet = Set<string | number>;

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
      selected_color: DEFAULT_COLORS.selected,
      not_selected_color: DEFAULT_COLORS.notSelected,
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

  get selected(): TSelectedSet {
    return new Set([...(this.get('selected') || [])]);
  }

  set selected(selected: TSelectedSet) {
    this.set({ selected: [...selected] });
    this.save_changes();
  }

  get selectedColor(): string {
    return this.get('selected_color') || DEFAULT_COLORS.selected;
  }

  get notSelectedColor(): string {
    return this.get('not_selected_color') || DEFAULT_COLORS.notSelected;
  }

  async registerGraph(hasGraph: IHasGraph): Promise<void> {
    this._graph = hasGraph;
    await hasGraph.rendered;
    hasGraph.graph.onNodeClick(this.onNodeClick);
  }

  onNodeClick = (node: NodeObject, event: MouseEvent): void => {
    let { selected } = this;
    const id = node.id;
    if (this.get('multiple') && (event.ctrlKey || event.shiftKey || event.altKey)) {
      selected.has(id) ? selected.delete(id) : selected.add(id);
    } else {
      selected.clear();
      selected.add(id);
    }

    this.selected = selected;
  };

  async onUpdate(hasGraph: IHasGraph): Promise<void> {
    if (hasGraph !== this._graph) {
      await this.registerGraph(hasGraph);
    }

    const { selected, selectedColor, notSelectedColor } = this;

    hasGraph.graph.nodeColor((node: NodeObject) => {
      return selected.has(node.id) ? selectedColor : notSelectedColor;
    });
  }
}
