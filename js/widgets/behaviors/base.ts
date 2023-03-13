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

export class FacetedModel extends BehaviorModel {
  static model_name = 'FacetedModel';

  /** Required in subclass. All novel traits of a faceted model might be dynamic  */
  static serializers = {
    ...WidgetModel.serializers,
  };

  /** Facets are cached as handlers for a specific entity. */
  protected _facets: Record<string, Function> = JSONExt.emptyObject as any;

  /** Names of facets are calculated once, on initialization. */
  protected _facetNames: string[] | null = null;

  /** Required in subclass. Provides acesss to class (for names) and usually facets. */
  protected get _modelClass(): typeof FacetedModel {
    return FacetedModel;
  }

  /** Required in subclass.
   * Provides acesss to the class which has facet serlializers, if different from the model class.
   */
  protected get _facetClass(): typeof FacetedModel {
    return this._modelClass;
  }

  defaults() {
    return {
      ...super.defaults(),
      _model_name: this._modelClass.model_name,
    };
  }

  get updateRequested(): ISignal<IBehave, TUpdateKind> {
    return this._updateRequested;
  }

  /** Initialize the model and wire up listeners.  */
  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    let events = '';
    for (const facet of this.facetNames) {
      events += `change:${facet} `;
    }
    this.on(events, this._onFacetsChanged, this);
    void this._onFacetsChanged.call(this);
  }

  /** Handle the facets changing. */
  protected async _onFacetsChanged() {
    this._facets = JSONExt.emptyObject as any;
    this._updateRequested.emit(void 0);
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

  /** Lazily calculate asset names. */
  protected get facetNames() {
    if (this._facetNames == null) {
      const baseKeys = [...Object.keys(FacetedModel.serializers)];
      const facetNames: string[] = [];
      for (const key of Object.keys(this._facetClass.serializers)) {
        if (baseKeys.includes(key)) {
          continue;
        }
        facetNames.push(key);
      }
      this._facetNames = facetNames;
    }
    return this._facetNames;
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

    function handler(opts: any) {
      return coercer(tmpl.render(opts));
    }

    const tmpl = await newTemplate(this.value);
    const coercer = getCoercer(this.coerce);
    this._nodeHandler = handler;
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
