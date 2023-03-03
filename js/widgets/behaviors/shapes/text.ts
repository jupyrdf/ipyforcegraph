/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type { Sprite } from 'three';
import type SpriteText from 'three-spritetext';

import { unpack_models as deserialize } from '@jupyter-widgets/base';

import { INodeCanvasBehaveOptions, INodeThreeBehaveOptions } from '../../../tokens';
import { ShapeBaseModel } from '../base';

import { IBaseOptions, ITextOptions, TBoundingBox, TEXT_DEFAULTS } from './base';

export class TextShapeModel extends ShapeBaseModel {
  static model_name = 'TextShapeModel';

  protected get _modelClass(): typeof TextShapeModel {
    return TextShapeModel;
  }

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

  drawNode2D(options: INodeCanvasBehaveOptions): void {
    const { context, node, globalScale } = options;
    const { x, y } = node;

    let draw = { ...TEXT_DEFAULTS, context, node, globalScale, x, y };

    for (const facetName of this._facetNames) {
      if (this._facets[facetName]) {
        draw[facetName] = this._facets[facetName](options);
      }
    }

    this._drawCanvas(draw);
  }

  drawNode3D(options: INodeThreeBehaveOptions): Sprite {
    const { node, iframeClasses } = options;
    const { x, y } = node;

    let draw = {
      ...TEXT_DEFAULTS,
      context: null,
      globalScale: null,
      node,
      x,
      y,
      iframeClasses,
    };

    for (const facetName of this._facetNames) {
      if (this._facets[facetName]) {
        draw[facetName] = this._facets[facetName](options);
      }
    }

    return this._drawThree(draw);
  }

  protected _drawThree(options: ITextOptions & IBaseOptions): SpriteText {
    const {
      text,
      fill,
      font,
      size,
      stroke,
      stroke_width,
      background,
      padding,
      iframeClasses,
    } = {
      ...TEXT_DEFAULTS,
      ...options,
    };

    const _SpriteText: typeof SpriteText = iframeClasses.SpriteText;

    const sprite = new _SpriteText(text);

    // make sprite background transparent
    sprite.material.depthWrite = false;
    sprite.textHeight = size;

    sprite.color = fill;
    sprite.fontFace = font;
    sprite.fontSize = size;

    if (stroke) {
      sprite.strokeColor = stroke;
      sprite.strokeWidth = stroke_width;
    }

    if (background) {
      sprite.backgroundColor = background;
      sprite.padding = padding;
    }

    return sprite;
  }

  protected _drawCanvas(options: ITextOptions & IBaseOptions): TBoundingBox {
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
