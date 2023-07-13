/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
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

    if (background) {
      const textWidth = context.measureText(text).width;
      const bb = [textWidth + fontSize * padding, fontSize + fontSize * padding];
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

  protected _drawCanvasLink(options: ITextOptions & ILinkCanvasOptions): void {
    const {
      background,
      context,
      fill,
      font,
      line_dash,
      link,
      padding,
      size,
      stroke_width,
      stroke,
      text,
    } = options;

    const start = link.source;
    const end = link.target;

    // ignore unbound links
    if (typeof start !== 'object' || typeof end !== 'object') {
      return;
    }

    // calculate label positioning
    const x = start.x + (end.x - start.x) / 2;
    const y = start.y + (end.y - start.y) / 2;

    const relLink = { x: end.x - start.x, y: end.y - start.y };
    const linkWidth = Math.sqrt(relLink.x * relLink.x + relLink.y * relLink.y);

    // maintain label vertical orientation for legibility
    let textAngle = Math.atan2(relLink.y, relLink.x);
    if (textAngle > Math.PI / 2) {
      textAngle = -(Math.PI - textAngle);
    }

    if (textAngle < -Math.PI / 2) {
      textAngle = -(-Math.PI - textAngle);
    }

    context.font = `${size}px ${font}`;

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

    context.save();
    context.translate(x, y);
    context.rotate(textAngle);

    if (background) {
      const bb = [textWidth + size * padding, size + size * padding];
      context.fillStyle = background;
      context.fillRect(-bb[0] / 2, -bb[1] / 2, bb[0], bb[1]);
    }

    context.textAlign = 'center';
    context.textBaseline = 'middle';

    if (stroke) {
      context.setLineDash(line_dash || []);
      context.strokeStyle = stroke;
      context.lineWidth = stroke_width;
      context.strokeText(text, x, y);
    }

    context.fillStyle = fill;
    context.fillText(label, 0, 0);
    context.restore();
  }
}
