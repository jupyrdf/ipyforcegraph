/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBackboneModelOptions } from '@jupyter-widgets/base';

import { TCoercer } from '../../tokens';
import { identity, noop } from '../../utils';

import { ColumnModel } from './base';

const noopHanlders = [noop, noop];

export class ContinuousColorModel extends ColumnModel {
  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on('change:scheme change:domain change:tint', this.valueChanged, this);
  }

  get tint() {
    return this.get('tint') || 0;
  }

  async _buildHandlers(value: any, coercer: TCoercer): Promise<Function[]> {
    let { scheme, domain, tint } = this;

    const min = domain[0];
    const max = domain.slice(-1)[0];

    const d3sc = await import('d3-scale-chromatic');
    const interpolate = d3sc[`interpolate${scheme}`];

    if (!interpolate) {
      console.warn(`${scheme} cannot be interpolated`);
      return noopHanlders;
    }

    let adjust = await _makeAdjuster(tint);

    const base = max - min;

    function _nodeHandler(options: any) {
      const v = coercer(options.node ? options.node[value] : null);
      return v == null ? v : adjust(interpolate((v - min) / base));
    }

    function _linkHandler(options: any) {
      const v = coercer(options.link ? options.link[value] : null);
      return v == null ? v : adjust(interpolate((v - min) / base));
    }

    return [_nodeHandler, _linkHandler];
  }

  get scheme(): string {
    return this.get('scheme');
  }

  get domain(): number[] {
    return this.get('domain') || [0, 1];
  }
}

export class OrdinalColorModel extends ColumnModel {
  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on(
      'change:scheme change:domain change:range change:sub_scheme change:tint',
      this.valueChanged,
      this
    );
  }

  get tint() {
    return this.get('tint') || 0;
  }

  async _buildHandlers(value: any, coercer: TCoercer): Promise<Function[]> {
    let { scheme, range, domain, tint } = this;
    const [d3sc, d3s] = await Promise.all([
      import('d3-scale-chromatic'),
      import('d3-scale'),
    ]);

    if (scheme) {
      const schemeRange = d3sc[`scheme${scheme}`];
      if (schemeRange) {
        range = schemeRange;
      }
    }

    const scale = d3s.scaleOrdinal(range).domain(domain);

    let adjust = await _makeAdjuster(tint);

    function _nodeHandler(options: any) {
      const v = coercer(options.node ? options.node[value] : null);
      return v == null ? v : adjust(scale(v));
    }

    function _linkHandler(options: any) {
      const v = coercer(options.link ? options.link[value] : null);
      return v == null ? v : adjust(scale(v));
    }

    return [_nodeHandler, _linkHandler];
  }

  get scheme(): string {
    return this.get('scheme');
  }

  get domain(): any[] {
    return this.get('domain') || [0, 1];
  }

  get range(): string[] {
    return this.get('range') || [];
  }
}

async function _makeAdjuster(tint: number): Promise<(value: string) => string> {
  if (tint == 0) {
    return identity;
  }
  const d3c = await import('d3-color');

  let colorMap: Record<string, string> = {};

  return (color: string): string => {
    let mapped = colorMap[color];
    if (!mapped) {
      let dc = d3c.color(color);
      mapped = colorMap[color] = (
        tint > 0 ? dc.brighter(tint) : dc.darker(-tint)
      ).formatRgb();
    }
    return mapped;
  };
}
