/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBackboneModelOptions } from '@jupyter-widgets/base';

import {
  DEFAULT_COLORS,
  IBehave,
  IExtraColumns,
  INodeBehaveOptions,
  INodeEventBehaveOptions,
  TSelectedSet,
  WIDGET_DEFAULTS,
} from '../../tokens';

import { BehaviorModel } from './base';

export class NodeSelectionModel extends BehaviorModel implements IBehave {
  static model_name = 'NodeSelectionModel';

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: NodeSelectionModel.model_name,
      selected: [],
      selected_color: DEFAULT_COLORS.selected,
      multiple: true,
    };
  }

  get extraColumns(): IExtraColumns {
    return { links: [], nodes: this.columnName ? [this.columnName] : [] };
  }

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on('change:selected change:column_name', this.onValueChange, this);
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

  get columnName(): string | null {
    return this.get('column_name') || null;
  }

  get multiple(): boolean {
    return this.get('multiple');
  }

  getNodeColor({ node }: INodeBehaveOptions): string | null {
    const index = (node as any).index;
    const color = index != null && this.selected.has(index) ? this.selectedColor : null;
    return color;
  }

  onNodeClick = ({
    node,
    index,
    event,
    graphData,
  }: INodeEventBehaveOptions): boolean => {
    let { selected, multiple, columnName } = this;
    const indexWasSelected = selected.has(index);

    if (multiple && (event.ctrlKey || event.shiftKey || event.altKey)) {
      indexWasSelected ? selected.delete(index) : selected.add(index);
    } else {
      if (columnName) {
        for (const oldIndex of selected) {
          const oldNode = graphData.nodes[oldIndex];
          oldNode && (oldNode[columnName] = false);
        }
      }
      selected.clear();
      !indexWasSelected && selected.add(index);
    }

    if (columnName) {
      node[columnName] = !indexWasSelected;
    }

    this.selected = selected;

    return true;
  };
}
