/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBackboneModelOptions } from '@jupyter-widgets/base';

import {
  DEFAULT_COLORS,
  IBehave,
  ILinkBehaveOptions,
  ILinkEventBehaveOptions,
  TSelectedSet,
  WIDGET_DEFAULTS,
} from '../../tokens';

import { BehaviorModel } from './base';

export class LinkSelectionModel extends BehaviorModel implements IBehave {
  static model_name = 'LinkSelectionModel';

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: LinkSelectionModel.model_name,
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

  getLinkColor({ index }: ILinkBehaveOptions): string | null {
    const color = this.selected.has(index) ? this.selectedColor : null;
    return color;
  }

  onLinkClick = ({ index, event }: ILinkEventBehaveOptions): boolean => {
    let { selected } = this;
    if (this.get('multiple') && (event.ctrlKey || event.shiftKey || event.altKey)) {
      selected.has(index) ? selected.delete(index) : selected.add(index);
    } else {
      selected.clear();
      selected.add(index);
    }

    this.selected = selected;

    return true;
  };
}
