/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { JSONExt } from '@lumino/coreutils';

import {
  IBackboneModelOptions,
  unpack_models as deserialize,
} from '@jupyter-widgets/base';

// import { ILinkBehaveOptions } from '../../tokens';
import { functor } from '../../utils';

import { BehaviorModel, DynamicModel } from './base';

const LINK_ARROW_FACETS = ['color', 'length', 'relative_position'];

const BOOL_FACETS = [];

export type TLinkArrowsFacet = (typeof LINK_ARROW_FACETS)[number];

export class LinkArrowsModel extends BehaviorModel {
  static model_name = 'LinkArrowsModel';

  defaults() {
    return { ...super.defaults(), _model_name: LinkArrowsModel.model_name };
  }

  protected facets: Record<TLinkArrowsFacet, Function> = JSONExt.emptyObject as any;

  static serializers = {
    ...BehaviorModel.serializers,
    color: { deserialize },
    length: { deserialize },
    relative_position: { deserialize },
  };

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on(
      'change:color change:length change:relative_position',
      this.onFacetsChanged,
      this
    );
    void this.onFacetsChanged.call(this);
  }

  async onFacetsChanged() {
    this.facets = JSONExt.emptyObject as any;
    this._updateRequested.emit(void 0);
  }

  async ensureFacets() {
    const facets: Record<string, Function> = {};
    for (const facetName of LINK_ARROW_FACETS) {
      let facet = this.get(facetName);
      if (facet instanceof DynamicModel) {
        await facet.ensureHandlers();
        facets[facetName] = facet.nodeHandler;
        facet.updateRequested.connect(this.onFacetsChanged, this);
        continue;
      }

      if (BOOL_FACETS.includes(facetName) && typeof facet === 'string') {
        facet = !!JSON.parse(facet.toLowerCase());
      }

      if (facet != null) {
        facets[facetName] = functor(facet);
      }
    }
    this.facets = facets;
  }
}
