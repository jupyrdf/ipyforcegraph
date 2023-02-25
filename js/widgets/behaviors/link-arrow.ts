/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { JSONExt } from '@lumino/coreutils';

import {
  IBackboneModelOptions,
  unpack_models as deserialize,
} from '@jupyter-widgets/base';

import { IBehave, ILinkBehaveOptions } from '../../tokens';
import { INodeCanvasBehaveOptions } from '../../tokens';
import { functor } from '../../utils';

import { LinkColumnOrTemplateModel } from './base';
import { DynamicModel } from './base';

export class LinkArrowModel extends LinkColumnOrTemplateModel implements IBehave {
  static model_name = 'LinkArrowModel';

  defaults() {
    return {
      ...super.defaults(),
      _model_name: LinkArrowModel.model_name,
    };
  }

  getLinkDirectionalArrowColor(options: ILinkBehaveOptions): string | null {
    return super.getLinkAttr(options);
  }
}

const FACETS = [
  'text',
  'font',
  'size',
  'fill',
  'padding',
  'background',
  'scale_on_zoom',
  'stroke',
  'stroke_width',
];

const BOOL_FACETS = ['scale_on_zoom'];

export type TFacet = (typeof FACETS)[number];

export class TextShapeModel extends ShapeBaseModel {
  static model_name = 'TextShapeModel';

  defaults() {
    return { ...super.defaults(), _model_name: TextShapeModel.model_name };
  }

  protected facets: Record<TFacet, Function> = JSONExt.emptyObject as any;

  static serializers = {
    ...ShapeBaseModel.serializers,
    text: { deserialize },
    font: { deserialize },
    size: { deserialize },
    fill: { deserialize },
    stroke: { deserialize },
    stroke_width: { deserialize },
    background: { deserialize },
    padding: { deserialize },
    scale_on_zoom: { deserialize },
  };

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on(
      'change:text change:font change:size change:fill change:background change:padding',
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
    for (const facetName of FACETS) {
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

  drawNode(options: INodeCanvasBehaveOptions): void {
    const { context, node, globalScale } = options;
    const { x, y } = node;

    let draw = { ...TEXT_DEFAULTS, context, node, globalScale, x, y };

    for (const facetName of FACETS) {
      if (this.facets[facetName]) {
        draw[facetName] = this.facets[facetName](options);
      }
    }

    this._draw(draw);
  }

  protected _draw(options: ITextOptions & IBaseOptions): TBoundingBox {
    const {
      context,
      text,
      size,
      globalScale,
      font,
      padding,
      fill,
      background,
      x,
      y,
      scale_on_zoom,
      stroke_width,
      stroke,
    } = {
      ...TEXT_DEFAULTS,
      ...options,
    };
    const fontSize = scale_on_zoom ? size / globalScale : size;
    context.font = `${fontSize}px ${font}`;
    const textWidth = context.measureText(text).width;
    const bb = [textWidth + fontSize * padding, fontSize + fontSize * padding];

    if (background) {
      context.fillStyle = background;
      context.fillRect(x - bb[0] / 2, y - bb[1] / 2, bb[0], bb[1]);
    }

    context.textAlign = 'center';
    context.textBaseline = 'middle';

    if (stroke) {
      context.strokeStyle = stroke;
      context.lineWidth = scale_on_zoom ? stroke_width / globalScale : stroke_width;
      context.strokeText(text, x, y);
    }

    context.fillStyle = fill;
    context.fillText(text, x, y);
    return bb;
  }
}
