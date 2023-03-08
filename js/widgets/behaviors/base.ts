/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { JSONExt } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';

import { IBackboneModelOptions, WidgetModel } from '@jupyter-widgets/base';

import { newTemplate } from '../../template-utils';
import { ECoerce, IBehave, TUpdateKind, WIDGET_DEFAULTS } from '../../tokens';
import { functor, getCoercer, noop } from '../../utils';

export class BehaviorModel extends WidgetModel implements IBehave {
  static model_name = 'BehaviorModel';

  protected _updateRequested: Signal<IBehave, TUpdateKind>;

  defaults() {
    return { ...super.defaults(), ...WIDGET_DEFAULTS };
  }

  /** Required in subclass. Provides acesss to active `__class__`. */
  protected get _modelClass(): typeof BehaviorModel {
    return BehaviorModel;
  }

  /** Facets are cached as handlers for a specific entity. */
  protected _facets: Record<string, Function> = JSONExt.emptyObject as any;

  /** Names of facets are calculated once, on initialization. */
  protected _facetNames: string[] | null = null;

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    let events = '';
    for (const facet of this.facetNames) {
      events += `change:${facet} `;
    }
    this.on(events, this._onFacetsChanged, this);
    void this._onFacetsChanged.call(this);
    this._updateRequested = new Signal(this);
  }

  get updateRequested(): ISignal<IBehave, TUpdateKind> {
    return this._updateRequested;
  }

  /** Lazily calculate asset names. */
  protected get facetNames() {
    if (this._facetNames == null) {
      const baseKeys = [...Object.keys(BehaviorModel.serializers)];
      const facetNames: string[] = [];
      for (const key of Object.keys(this._modelClass.serializers)) {
        if (baseKeys.includes(key)) {
          continue;
        }
        facetNames.push(key);
      }
      this._facetNames = facetNames;
    }
    return this._facetNames;
  }

  /** Populate facet handlers. */
  async ensureFacets() {
    const facets: Record<string, Function> = {};
    for (const facetName of this.facetNames) {
      let facet = this.get(facetName);
      if (facet instanceof DynamicModel) {
        await facet.ensureHandlers();
        facets[facetName] = facet.nodeHandler;
        facet.updateRequested.connect(this._onFacetsChanged, this);
        continue;
      }

      if (facet != null) {
        facets[facetName] = functor(facet);
      }
    }
    this._facets = facets;
  }

  /** Handle the fact changing. */
  protected async _onFacetsChanged() {
    this._facets = JSONExt.emptyObject as any;
    this._updateRequested.emit(void 0);
  }
}

// TODO: Would it be more clear to call this DynamicValueModel?
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

  // TODO: should we also observe changes to coerce?

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
