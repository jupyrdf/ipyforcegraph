/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBackboneModelOptions } from '@jupyter-widgets/base';

import { TCoercer } from '../../tokens';
import { noop } from '../../utils';

import { ColumnModel } from './base';

const noopHanlders = [noop, noop];

export class ContinuousColorModel extends ColumnModel {
  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on('change:scheme change:domain change:column_name', this.valueChanged, this);
  }

  async _buildHandlers(value: any, coercer: TCoercer): Promise<Function[]> {
    let { scheme, domain } = this;

    const min = domain[0];
    const max = domain.slice(-1)[0];

    const d3sc = await import('d3-scale-chromatic');
    const interpolate = d3sc[`interpolate${scheme}`];

    if (!interpolate) {
      console.warn(`${scheme} cannot be interpolated`);
      return noopHanlders;
    }

    const base = max - min;

    function _nodeHandler(this: ContinuousColorModel, options: any) {
      let { columnName } = this;
      const v = coercer(options.node ? options.node[value] : null);
      const c = v == null ? null : interpolate((v - min) / base);
      if (columnName != null && c != null) {
        options.node[columnName] = c;
      }
      return c;
    }

    function _linkHandler(this: ContinuousColorModel, options: any) {
      let { columnName } = this;
      const v = coercer(options.link ? options.link[value] : null);
      const c = v == null ? null : interpolate((v - min) / base);
      if (columnName != null && c != null) {
        options.link[columnName] = c;
      }
      return c;
    }

    return [_nodeHandler, _linkHandler];
  }

  get scheme(): string {
    return this.get('scheme');
  }

  get domain(): number[] {
    return this.get('domain') || [0, 1];
  }

  get columnName(): string {
    return this.get('column_name');
  }
}

export class OrdinalColorModel extends ColumnModel {
  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on(
      'change:scheme change:domain change:range change:sub_scheme change:column_name',
      this.valueChanged,
      this
    );
  }

  async _buildHandlers(value: any, coercer: TCoercer): Promise<Function[]> {
    let { scheme, range, domain } = this;
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

    function _nodeHandler(this: ContinuousColorModel, options: any) {
      let { columnName } = this;
      const v = coercer(options.node ? options.node[value] : null);
      const c = v == null ? null : scale(v);
      if (columnName != null && c != null) {
        options.node[columnName] = c;
      }
      return c;
    }

    function _linkHandler(this: ContinuousColorModel, options: any) {
      let { columnName } = this;
      const v = coercer(options.link ? options.link[value] : null);
      const c = v == null ? null : scale(v);
      if (columnName != null && c != null) {
        options.link[columnName] = c;
      }
      return c;
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

  get columnName(): string {
    return this.get('column_name');
  }
}
