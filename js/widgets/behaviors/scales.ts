/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBackboneModelOptions } from '@jupyter-widgets/base';

import { TCoercer } from '../../tokens';
import { noop } from '../../utils';

import { ColumnModel } from './base';

export class ColorScaleColumnModel extends ColumnModel {
  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on(
      'change:scheme change:domain change:range change:interpolate change:sub_scheme',
      this.valueChanged,
      this
    );
  }

  async _buildHandlers(value: any, coercer: TCoercer): Promise<Function[]> {
    const { interpolate } = this;
    let handlers: Function[] = [noop, noop];

    try {
      if (interpolate) {
        handlers = await this._buildInterpolateHandlers(value, coercer);
      } else {
        handlers = await this._buildOrdinalHandlers(value, coercer);
      }
    } catch (err) {
      console.warn('Failed to build interpolated scheme', err);
    }

    return handlers;
  }

  async _buildOrdinalHandlers(value: any, coercer: TCoercer): Promise<Function[]> {
    let { scheme, range, domain, subScheme } = this;
    if (scheme) {
      const [d3sc, d3s] = await Promise.all([
        import('d3-scale-chromatic'),
        import('d3-scale'),
      ]);
      const schemeRange = d3sc[`scheme${scheme}`];
      if (schemeRange) {
        if (typeof schemeRange[0] === 'string') {
          range = schemeRange;
        } else {
          if (subScheme == null) {
            range = schemeRange.slice(-1)[0];
          } else {
            let subSchemeRange = schemeRange[subScheme];
            if (subSchemeRange) {
              range = subSchemeRange;
            }
          }
        }
      }
      const scale = d3s.scaleOrdinal(range).domain(domain);

      function _nodeHandler(options: any) {
        const v = coercer(options.node ? options.node[value] : null);
        return v == null ? v : scale(v);
      }

      function _linkHandler(options: any) {
        const v = coercer(options.link ? options.link[value] : null);
        return v == null ? v : scale(v);
      }

      return [_nodeHandler, _linkHandler];
    }
  }

  async _buildInterpolateHandlers(value: any, coercer: TCoercer): Promise<Function[]> {
    let { scheme, domain } = this;

    const min = domain[0];
    const max = domain.slice(-1)[0];

    const d3sc = await import('d3-scale-chromatic');
    const interpolate = d3sc[`interpolate${scheme}`];

    if (!interpolate) {
      throw new Error(`${scheme} cannot be interpolated`);
    }

    const base = max - min;

    function _nodeHandler(options: any) {
      const v = coercer(options.node ? options.node[value] : null);
      return v == null ? v : interpolate((v - min) / base);
    }

    function _linkHandler(options: any) {
      const v = coercer(options.link ? options.link[value] : null);
      return v == null ? v : interpolate((v - min) / base);
    }

    return [_nodeHandler, _linkHandler];
  }

  get scheme(): string {
    return this.get('scheme');
  }
  get interpolate(): boolean {
    return this.get('interpolate');
  }
  get domain(): any[] {
    return this.get('domain') || [0, 1];
  }
  get range(): string[] {
    return this.get('range') || [];
  }
  get subScheme(): number {
    return this.get('sub_scheme');
  }
}
