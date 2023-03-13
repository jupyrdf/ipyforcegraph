/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBackboneModelOptions } from '@jupyter-widgets/base';

import {
  DEFAULT_COLORS,
  DEFAULT_WIDTHS,
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
      selected_width: DEFAULT_WIDTHS.selected,
      multiple: true,
    };
  }

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on('change:selected change:selected_column', this.onValueChange, this);
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

  get selectedWidth(): string {
    return this.get('selected_width') || DEFAULT_WIDTHS.selected;
  }

  get columnName(): string | null {
    return this.get('column_name') || null;
  }

  get multiple(): boolean {
    return this.get('multiple');
  }

  getLinkWidth({ index }: ILinkBehaveOptions): number | null {
    const width = this.selected.has(index) ? this.selectedWidth : null;
    if (width != null) {
      return parseFloat(width);
    }
    return null;
  }

  getLinkColor({ index }: ILinkBehaveOptions): string | null {
    const color = this.selected.has(index) ? this.selectedColor : null;
    return color;
  }

  onLinkClick = ({
    link,
    index,
    event,
    graphData,
  }: ILinkEventBehaveOptions): boolean => {
    let { selected, columnName, multiple } = this;
    const indexWasSelected = selected.has(index);
    if (multiple && (event.ctrlKey || event.shiftKey || event.altKey)) {
      indexWasSelected ? selected.delete(index) : selected.add(index);
    } else {
      if (columnName) {
        for (const oldIndex of selected) {
          const oldLink = graphData.links[oldIndex];
          oldLink && (oldLink[columnName] = false);
        }
      }
      selected.clear();
      !indexWasSelected && selected.add(index);
    }

    if (columnName) {
      link[columnName] = !indexWasSelected;
    }

    this.selected = selected;

    return true;
  };
}
