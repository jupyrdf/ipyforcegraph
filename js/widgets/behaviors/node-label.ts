/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type { Template } from 'nunjucks';

import { WidgetModel, unpack_models as deserialize } from '@jupyter-widgets/base';

import {
  EMOJI,
  IBehave,
  IHasGraph,
  INodeBehaveOptions,
  WIDGET_DEFAULTS,
} from '../../tokens';

import { BehaviorModel } from './base';

export class NodeLabelModel extends BehaviorModel implements IBehave {
  static model_name = 'NodeLabelModel';
  static serializers = {
    ...WidgetModel.serializers,
    value: { deserialize },
  };

  protected _nunjucksTemplate: Template | null;

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: NodeLabelModel.model_name,
      column_name: null,
      template: null,
    };
  }

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);
    this.on('change:column_name', this.onColumnNameChange, this);
    this.on('change:template', this.onTemplateChange, this);
  }

  get template(): string | null {
    return this.get('template') || null;
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

  columnName(hasGraph: IHasGraph): string | null {
    let columnName = this.get('column_name');
    if (columnName == null) {
      try {
        columnName = (hasGraph.source as any).get('node_id_column');
      } catch (err) {
        console.error('failed to fetch id column', err);
      }
    }
    return columnName || null;
  }

  protected onColumnNameChange(change?: any) {
    this._updateRequested.emit(void 0);
  }

  getNodeLabel(options: INodeBehaveOptions): string | null {
    const { _nunjucksTemplate } = this;

    if (_nunjucksTemplate != null) {
      try {
        return _nunjucksTemplate.render(options);
      } catch (err) {
        console.warn(EMOJI, err, err['message']);
        this._nunjucksTemplate = null;
      }
    }

    const columnName = this.columnName(options.view);
    let label = null;
    if (columnName != null) {
      label = options.node[columnName];
    }
    return label || null;
  }
}
