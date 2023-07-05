/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type SpriteText from 'three-spritetext';

import {
  EMark,
  INodeCanvasBehaveOptions,
  INodeThreeBehaveOptions,
} from '../../../tokens';
import { widget_serialization } from '../../serializers/widget';

import { IBaseOptions, ITextOptions, ShapeBaseModel, TEXT_DEFAULTS } from './base';

export class TextShapeModel extends ShapeBaseModel {
  static model_name = 'TextShapeModel';

  protected get _modelClass(): typeof TextShapeModel {
    return TextShapeModel;
  }

  static serializers = {
    ...ShapeBaseModel.serializers,
    text: widget_serialization,
    font: widget_serialization,
    size: widget_serialization,
    fill: widget_serialization,
    stroke: widget_serialization,
    stroke_width: widget_serialization,
    background: widget_serialization,
    padding: widget_serialization,
    scale_on_zoom: widget_serialization,
    line_dash: widget_serialization,
  };

  drawNode2D(options: INodeCanvasBehaveOptions): void {
    const { context, node, globalScale } = options;
    const { x, y } = node;

    const drawOptions = {
      ...TEXT_DEFAULTS,
      context,
      globalScale,
      x,
      y,
      ...this._resolveFacets(options, EMark.node),
    };

    if (drawOptions.text == null || !`${drawOptions.text}`.trim().length) {
      return;
    }

    this._drawCanvas(drawOptions);
  }

  drawNode3D(options: INodeThreeBehaveOptions): SpriteText | null {
    const { node, iframeClasses } = options;
    const { x, y } = node;

    const drawOptions = {
      ...TEXT_DEFAULTS,
      context: null,
      globalScale: null,
      x,
      y,
      iframeClasses,
      ...this._resolveFacets(options, EMark.node),
    };

    if (!drawOptions.text) {
      return null;
    }

    return this._drawThree(drawOptions);
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

  protected _drawCanvas(options: ITextOptions & IBaseOptions): void {
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
      line_dash,
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
      context.setLineDash(line_dash || []);
      context.strokeStyle = stroke;
      context.lineWidth = scale_on_zoom ? stroke_width / globalScale : stroke_width;
      context.strokeText(text, x, y);
    }

    context.fillStyle = fill;
    context.fillText(text, x, y);
  }
}
