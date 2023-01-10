/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type { Template } from 'nunjucks';

import { EMOJI, IBehave, INodeBehaveOptions, WIDGET_DEFAULTS } from '../../tokens';

import { BehaviorModel } from './base';

export class NodeColorModel extends BehaviorModel implements IBehave {
  static model_name = 'NodeColorModel';
  protected _nunjucksTemplate: Template | null;

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: NodeColorModel.model_name,
      column_name: null,
      template: null,
    };
  }

  get columnName(): string | null {
    return this.get('column_name') || null;
  }

  get template(): string | null {
    return this.get('template') || null;
  }

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);
    this.on('change:column_name', this.onColumnNameChange, this);
    this.on('change:template', this.onTemplateChange, this);
  }

  protected async onTemplateChange(): Promise<void> {
    const { template } = this;
    if (template == null) {
      this._nunjucksTemplate = null;
    } else {
      const nunjucks = await import('nunjucks');
      try {
        this._nunjucksTemplate = new nunjucks.Template(template);
      } catch (err) {
        console.warn(EMOJI, err);
        this._nunjucksTemplate = null;
      }
    }
    this._updateRequested.emit(void 0);
  }

  protected onColumnNameChange(change?: any) {
    this._updateRequested.emit(void 0);
  }

  getNodeColor(options: INodeBehaveOptions): string | null {
    const { _nunjucksTemplate } = this;

    if (_nunjucksTemplate != null) {
      try {
        return _nunjucksTemplate.render(options);
      } catch (err) {
        console.warn(EMOJI, err);
      }
    }

    const { columnName } = this;

    let color = null;

    if (columnName != null) {
      color = options.node[columnName];
    }

    return color || null;
  }
}
