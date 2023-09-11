/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type * as D3Color from 'd3-color';

import { IBackboneModelOptions } from '@jupyter-widgets/base';

import { replaceCssVars } from '../../theme-utils';
import { widget_serialization } from '../serializers/widget';

import { DynamicModel } from './base';

export class WrapperModel extends DynamicModel {
  static serializers = {
    ...DynamicModel.serializers,
    wrapped: widget_serialization,
  };

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on('change:wrapped', this.wrappedChanged, this);
    this.wrappedChanged();
  }

  get wrapped(): DynamicModel {
    return this.get('wrapped');
  }

  get previousWrapped(): DynamicModel | null {
    return (this.previous && this.previous('wrapped')) || null;
  }

  protected wrappedChanged() {
    const { wrapped, previousWrapped } = this;
    if (previousWrapped && previousWrapped.updateRequested) {
      previousWrapped.updateRequested.disconnect(this.valueChanged, this);
    }
    if (wrapped && wrapped.updateRequested) {
      wrapped.updateRequested.connect(this.valueChanged, this);
    }
    this.valueChanged();
  }
}

export class CaptureAsModel extends WrapperModel {
  static model_name = 'CaptureAsModel';

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on('change:colunmn_name', this.valueChanged, this);
  }

  get columnName(): string {
    return this.get('column_name');
  }

  async ensureHandlers(): Promise<void> {
    if (this._nodeHandler && this._linkHandler) {
      return;
    }
    const { columnName, wrapped } = this;

    if (wrapped.ensureHandlers) {
      await wrapped.ensureHandlers();
      this._nodeHandler = (opts: any) => {
        const value = (opts.node[columnName] = wrapped.nodeHandler(opts));
        return value;
      };
      this._linkHandler = (opts: any) => {
        const value = (opts.link[columnName] = wrapped.linkHandler(opts));
        return value;
      };
    } else {
      this._nodeHandler = (opts: any) => {
        return (opts.node[columnName] = wrapped);
      };
      this._linkHandler = (opts: any) => {
        return (opts.link[columnName] = wrapped);
      };
    }
  }
}

export class ReplaceCssVariablesModel extends WrapperModel {
  static model_name = 'ReplaceCssVariablesModel';

  async ensureHandlers(): Promise<void> {
    if (this._nodeHandler) {
      return;
    }
    const { wrapped } = this;
    if (wrapped.ensureHandlers) {
      await wrapped.ensureHandlers();
      this._nodeHandler = (opts: any) => replaceCssVars(wrapped.nodeHandler(opts));
      this._linkHandler = (opts: any) => replaceCssVars(wrapped.linkHandler(opts));
    } else {
      this._nodeHandler = (opts: any) => replaceCssVars(`${wrapped}`);
      this._linkHandler = (opts: any) => replaceCssVars(`${wrapped}`);
    }
  }
}

const SPACES = {
  rgb: ['r', 'g', 'b', 'opacity'],
  hsl: ['h', 's', 'l', 'opacity'],
  lab: ['l', 'a', 'b', 'opacity'],
  hcl: ['l', 'c', 'h', 'opacity'],
  cubehelix: ['h', 's', 'l', 'opacity'],
};

const OPT_KEYS = ['space', 'r', 'g', 'b', 'a', 'h', 's', 'l', 'c', 'opacity'];

interface ISpaceOptions {
  space: keyof typeof SPACES;
  a: number | null;
  b: number | null;
  c: number | null;
  g: number | null;
  h: number | null;
  l: number | null;
  r: number | null;
  s: number | null;
  opacity: number | null;
}

export class ColorizeModel extends WrapperModel {
  static model_name = 'ColorizeModel';

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    const events = [];
    for (let key of OPT_KEYS) {
      events.push(`change:${key}`);
    }
    this.on(events.join(' '), this.valueChanged, this);
  }

  async ensureHandlers(): Promise<void> {
    if (this._nodeHandler) {
      return;
    }
    const cache: Record<string, string> = {};
    const d3c = await import('d3-color');
    const colorOpts: Partial<ISpaceOptions> = {};
    for (let opt of OPT_KEYS) {
      colorOpts[opt] = this.get(opt);
    }
    const { wrapped } = this;
    if (wrapped.ensureHandlers) {
      await wrapped.ensureHandlers();
      this._nodeHandler = (opts: any) => {
        return _colorize(
          wrapped.nodeHandler(opts),
          colorOpts as ISpaceOptions,
          d3c,
          cache
        );
      };
      this._linkHandler = (opts: any) => {
        return _colorize(
          wrapped.linkHandler(opts),
          colorOpts as ISpaceOptions,
          d3c,
          cache
        );
      };
    } else {
      this._nodeHandler = (opts: any) => {
        return _colorize(wrapped as any, colorOpts as ISpaceOptions, d3c, cache);
      };
      this._linkHandler = (opts: any) => {
        return _colorize(wrapped as any, colorOpts as ISpaceOptions, d3c, cache);
      };
    }
  }
}

function _colorize(
  color: string,
  opts: ISpaceOptions,
  d3c: typeof D3Color,
  cache: Record<string, string>
): string {
  let mapped = cache[color];
  if (!mapped) {
    const dColor = d3c[opts.space](color);
    for (let channel of SPACES[opts.space]) {
      const value = opts[channel];
      if (value != null) {
        dColor[channel] += value;
      }
    }
    mapped = cache[color] = `${dColor}`;
  }
  return mapped;
}

export class TintModel extends WrapperModel {
  static model_name = 'TintModel';

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on('change:value', this.valueChanged, this);
  }

  async ensureHandlers(): Promise<void> {
    if (this._nodeHandler) {
      return;
    }
    const value = this.get('value');
    const cache: Record<string, string> = {};
    const d3c = await import('d3-color');
    const { wrapped } = this;
    if (wrapped.ensureHandlers) {
      await wrapped.ensureHandlers();
      this._nodeHandler = (opts: any) => {
        return _tint(wrapped.nodeHandler(opts), value, d3c, cache);
      };
      this._linkHandler = (opts: any) => {
        return _tint(wrapped.linkHandler(opts), value, d3c, cache);
      };
    } else {
      this._nodeHandler = (opts: any) => {
        return _tint(wrapped as any, value, d3c, cache);
      };
      this._linkHandler = (opts: any) => {
        return _tint(wrapped as any, value, d3c, cache);
      };
    }
  }
}

function _tint(
  color: string,
  tint: number,
  d3c: typeof D3Color,
  cache: Record<string, string>
): string {
  if (tint === 0) {
    return color;
  }
  let mapped = cache[color];
  if (!mapped) {
    let dc = d3c.color(color);
    mapped = cache[color] = (
      tint > 0 ? dc.brighter(tint) : dc.darker(-tint)
    ).formatRgb();
  }
  return mapped;
}
