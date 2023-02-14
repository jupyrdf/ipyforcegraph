/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type { Template } from 'nunjucks';

import { ISignal, Signal } from '@lumino/signaling';

import { IBackboneModelOptions, WidgetModel } from '@jupyter-widgets/base';

import { newTemplate } from '../../template-utils';
import {
  EMOJI,
  IBehave,
  IHasGraph,
  ILinkBehaveOptions,
  INodeBehaveOptions,
  TUpdateKind,
  WIDGET_DEFAULTS,
} from '../../tokens';

export class BehaviorModel extends WidgetModel implements IBehave {
  protected _updateRequested: Signal<IBehave, TUpdateKind>;

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this._updateRequested = new Signal(this);
  }

  get updateRequested(): ISignal<IBehave, TUpdateKind> {
    return this._updateRequested;
  }
}

export class ColumnOrTemplateModel extends BehaviorModel implements IBehave {
  protected _nunjucksTemplate: Template | null;

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      column_name: null,
      template: null,
    };
  }

  getColumnName(hasGraph: IHasGraph): string | null {
    return this.get('column_name') || null;
  }

  get template(): string | null {
    return this.get('template') || null;
  }

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on('change:column_name', this.onColumnNameChange, this);
    this.on('change:template', this.onTemplateChange, this);
  }

  protected async onTemplateChange(): Promise<void> {
    const { template } = this;
    if (template == null) {
      this._nunjucksTemplate = null;
    } else {
      try {
        this._nunjucksTemplate = await newTemplate(template);
      } catch (err) {
        console.warn(EMOJI, err['message']);
        this._nunjucksTemplate = null;
      }
    }
    this._updateRequested.emit(void 0);
  }

  protected onColumnNameChange(change?: any) {
    this._updateRequested.emit(void 0);
  }

  renderTemplate(options: any): string | null {
    const { _nunjucksTemplate } = this;

    if (_nunjucksTemplate != null) {
      try {
        return _nunjucksTemplate.render(options);
      } catch (err) {
        console.warn(EMOJI, err);
      }
    }
  }
}

export class NodeColumnOrTemplateModel
  extends ColumnOrTemplateModel
  implements IBehave
{
  protected _nunjucksTemplate: Template | null;

  protected getNodeAttr(options: INodeBehaveOptions): string | null {
    let value = this.renderTemplate(options);

    if (value != null) {
      return value;
    }

    const columnName = this.getColumnName(options.view);

    if (columnName != null) {
      value = options.node[columnName];
    }

    return value || null;
  }
}

export class LinkColumnOrTemplateModel
  extends ColumnOrTemplateModel
  implements IBehave
{
  protected _nunjucksTemplate: Template | null;

  protected getLinkAttr(options: ILinkBehaveOptions): string | null {
    let value = this.renderTemplate(options);

    if (value != null) {
      return value;
    }

    const columnName = this.getColumnName(options.view);

    if (columnName != null) {
      value = options.link[columnName];
    }

    return value || null;
  }
}
