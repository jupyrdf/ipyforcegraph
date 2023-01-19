/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import {
  IBackboneModelOptions,
  WidgetModel,
  unpack_models as deserialize,
} from '@jupyter-widgets/base';

import {
  DEFAULT_COLORS,
  IBehave,
  INodeBehaveOptions,
  INodeEventBehaveOptions,
  WIDGET_DEFAULTS,
} from '../../tokens';

import { BehaviorModel } from './base';

export type TSelectedSet = Set<string | number>;

export class NodeSelectionModel extends BehaviorModel implements IBehave {
  static model_name = 'NodeSelectionModel';
  static serializers = {
    ...WidgetModel.serializers,
    value: { deserialize },
  };

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

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
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

  getNodeColor({ node }: INodeBehaveOptions): string | null {
    const color = this.selected.has(node.id) ? this.selectedColor : null;
    return color;
  }

  onNodeClick = ({ node, event }: INodeEventBehaveOptions): boolean => {
    let { selected } = this;
    const id = node.id;
    if (this.get('multiple') && (event.ctrlKey || event.shiftKey || event.altKey)) {
      selected.has(id) ? selected.delete(id) : selected.add(id);
    } else {
      selected.clear();
      selected.add(id);
    }

    this.selected = selected;

    return true;
  };
}
