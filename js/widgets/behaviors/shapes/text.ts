/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 *
 * Derived from:
 * https://github.com/vasturiano/force-graph/blob/master/example/text-links/index.html
 */
import type SpriteText from 'three-spritetext';

import {
  EMark,
  ILinkCanvasBehaveOptions,
  INodeCanvasBehaveOptions,
  INodeThreeBehaveOptions,
} from '../../../tokens';
import { widget_serialization } from '../../serializers/widget';

import {
  ILinkCanvasOptions,
  INodeCanvasOptions,
  INodeOptions,
  ITextOptions,
  ShapeBaseModel,
  TEXT_DEFAULTS,
} from './base';

const ELLIPSIS = ' …';

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
    offset_x: widget_serialization,
    offset_y: widget_serialization,
    offset_z: widget_serialization,
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

    this._drawCanvasNode(drawOptions);
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

    return this._drawThreeNode(drawOptions);
  }

  drawLink2D(options: ILinkCanvasBehaveOptions): void {
    const { context, link } = options;

    const drawOptions = {
      ...TEXT_DEFAULTS,
      context,
      link,
      ...this._resolveFacets(options, EMark.link),
    };

    if (drawOptions.text == null || !`${drawOptions.text}`.trim().length) {
      return;
    }

    this._drawCanvasLink(drawOptions);
  }

  protected _drawThreeNode(options: ITextOptions & INodeOptions): SpriteText {
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

  protected _drawCanvasNode(options: ITextOptions & INodeCanvasOptions): void {
    let {
      context,
      text,
      size,
      globalScale,
      font,
      padding,
      background,
      x,
      y,
      scale_on_zoom,
      offset_x,
      offset_y,
    } = {
      ...TEXT_DEFAULTS,
      ...options,
    };
    x = offset_x ? x + offset_x : x;
    y = offset_y ? y + offset_y : y;
    const fontSize = scale_on_zoom ? size / globalScale : size;
    context.font = `${fontSize}px ${font}`;

    if (background) {
      const textWidth = context.measureText(text).width;
      const bb = [textWidth + fontSize * padding, fontSize + fontSize * padding];
      context.fillStyle = background;
      context.fillRect(x - bb[0] / 2, y - bb[1] / 2, bb[0], bb[1]);
    }

    this._drawCanvasText(text, x, y, options);
  }

  protected _drawCanvasLink(options: ITextOptions & ILinkCanvasOptions): void {
    const { background, context, font, link, padding, size, offset_x, offset_y } =
      options;

    if (typeof link.source !== 'object' || typeof link.target !== 'object') {
      return;
    }

    context.font = `${size}px ${font}`;

    const [x, y, textAngle, linkWidth] = this._getTextTransforms(options);

    const [label, textWidth] = this._getTruncatedCanvasText(linkWidth, options);

    context.save();
    context.translate(x, y);
    context.rotate(textAngle);

    if (background) {
      const bb = [textWidth + size * padding, size + size * padding];
      context.fillStyle = background;
      context.fillRect(offset_x - bb[0] / 2, offset_y - bb[1] / 2, bb[0], bb[1]);
    }

    this._drawCanvasText(label, offset_x, offset_y, options);

    context.restore();
  }

  _getTextTransforms(
    options: ITextOptions & ILinkCanvasOptions
  ): [number, number, number, number] {
    const { link } = options;
    const { source, target } = link;

    // ignore unbound links
    if (typeof source !== 'object' || typeof target !== 'object') {
      return;
    }

    // calculate label positioning
    const x = source.x + (target.x - source.x) / 2;
    const y = source.y + (target.y - source.y) / 2;

    const relLink = { x: target.x - source.x, y: target.y - source.y };
    const linkWidth = Math.sqrt(relLink.x * relLink.x + relLink.y * relLink.y);

    // maintain label vertical orientation for legibility
    let textAngle = Math.atan2(relLink.y, relLink.x);
    if (textAngle > Math.PI / 2) {
      textAngle = -(Math.PI - textAngle);
    }

    if (textAngle < -Math.PI / 2) {
      textAngle = -(-Math.PI - textAngle);
    }
    return [x, y, textAngle, linkWidth];
  }

  _getTruncatedCanvasText(
    linkWidth: number,
    options: ITextOptions & ILinkCanvasOptions
  ): [string, number] {
    const { text, context, size } = options;
    let label = text;
    let textWidth = context.measureText(text).width;
    let extraPad = 3 * size;

    if (textWidth + extraPad > linkWidth) {
      while (label.length && textWidth + extraPad > linkWidth) {
        label = label.slice(0, -1).trim();
        textWidth = context.measureText(`${label}${ELLIPSIS}`.trim()).width;
      }
      label = `${label}${ELLIPSIS}`.trim();
    }

    return [label, textWidth];
  }

  _drawCanvasText(
    text: string,
    x: number,
    y: number,
    options: ITextOptions & (ILinkCanvasOptions | INodeCanvasOptions)
  ) {
    const { line_dash, context, stroke, stroke_width, fill } = options;

    context.textAlign = 'center';
    context.textBaseline = 'middle';

    if (stroke) {
      context.setLineDash(line_dash || []);
      context.strokeStyle = stroke;
      context.lineWidth = stroke_width;
      context.lineJoin = 'round';
      context.strokeText(text, x, y);
    }

    context.fillStyle = fill;
    context.fillText(text, x, y);
  }
}
