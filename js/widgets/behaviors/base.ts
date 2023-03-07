/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { ISignal, Signal } from '@lumino/signaling';

import { IBackboneModelOptions, WidgetModel } from '@jupyter-widgets/base';

import { newTemplate } from '../../template-utils';
import { ECoerce, IBehave, TUpdateKind, WIDGET_DEFAULTS } from '../../tokens';
import { getCoercer, noop } from '../../utils';

export class BehaviorModel extends WidgetModel implements IBehave {
  protected _updateRequested: Signal<IBehave, TUpdateKind>;

  defaults() {
    return { ...super.defaults(), ...WIDGET_DEFAULTS };
  }

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this._updateRequested = new Signal(this);
  }

  get updateRequested(): ISignal<IBehave, TUpdateKind> {
    return this._updateRequested;
  }
}

export class DynamicModel extends BehaviorModel {
  protected _nodeHandler: Function | null = null;
  protected _linkHandler: Function | null = null;

  defaults() {
    return { ...super.defaults(), value: '', coerce: null };
  }

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on('change:value', this.valueChanged, this);
  }

  valueChanged(): void {
    this._nodeHandler = null;
    this._linkHandler = null;
    this._updateRequested.emit(void 0);
  }

  get updateRequested(): ISignal<IBehave, TUpdateKind> {
    return this._updateRequested;
  }

  async ensureHandlers() {
    // nothing to see here
  }

  get value(): string {
    return this.get('value') || '';
  }

  get nodeHandler(): Function | null {
    return this._nodeHandler || noop;
  }

  get linkHandler(): Function | null {
    return this._linkHandler || noop;
  }

  get coerce(): ECoerce | null {
    return this.get('coerce') || null;
  }
}

export class NunjucksModel extends DynamicModel {
  async ensureHandlers() {
    if (this._nodeHandler) {
      return;
    }
    const tmpl = await newTemplate(this.value);
    const coercer = getCoercer(this.coerce);
    this._nodeHandler = (opts: any) => coercer(tmpl.render(opts));
    this._linkHandler = this._nodeHandler;
  }
}

export class ColumnModel extends DynamicModel {
  async ensureHandlers() {
    if (this._nodeHandler) {
      return;
    }
    const { value } = this;
    const coercer = getCoercer(this.coerce);
    this._nodeHandler = (options: any) => coercer(options.node[value]);
    this._linkHandler = (options: any) => coercer(options.link[value]);
  }
}
