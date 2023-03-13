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

export class LinkEmitParticleModel extends BehaviorModel implements IBehave {
  static model_name = 'LinkEmitParticleModel';

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: LinkEmitParticleModel.model_name,
      selected: [],
      selected_color: DEFAULT_COLORS.selected,
      selected_width: DEFAULT_WIDTHS.selected,
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

  get selectedWidth(): string {
    return this.get('selected_width') || DEFAULT_WIDTHS.selected;
  }

  get multiple(): boolean {
    return this.get('multiple');
  }

  getLinkWidth({ index }: ILinkBehaveOptions): string | null {
    const width = this.selected.has(index) ? this.selectedWidth : null;
    return width;
  }

  getLinkColor({ index }: ILinkBehaveOptions): string | null {
    const color = this.selected.has(index) ? this.selectedColor : null;
    return color;
  }

  onLinkClick = ({ index, event }: ILinkEventBehaveOptions): boolean => {
    let { selected, multiple } = this;
    const indexSelected = selected.has(index);
    if (multiple && (event.ctrlKey || event.shiftKey || event.altKey)) {
      indexSelected ? selected.delete(index) : selected.add(index);
    } else {
      selected.clear();
      !indexSelected && selected.add(index);
    }

    this.selected = selected;

    return true;
  };
}
