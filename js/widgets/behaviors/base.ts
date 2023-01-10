/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type { Template } from 'nunjucks';

import { ISignal, Signal } from '@lumino/signaling';

import { WidgetModel } from '@jupyter-widgets/base';

import {
  EMOJI,
  IBehave,
  IHasGraph,
  INodeBehaveOptions,
  WIDGET_DEFAULTS,
} from '../../tokens';

export class BehaviorModel extends WidgetModel implements IBehave {
  protected _updateRequested: Signal<IBehave, void>;

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);
    this._updateRequested = new Signal(this);
  }

  get updateRequested(): ISignal<IBehave, void> {
    return this._updateRequested;
  }

  onUpdate(hasGraph: IHasGraph) {
    throw new Error('unimplemented');
  }
}

export class NodeColumnOrTemplate extends BehaviorModel implements IBehave {
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
        console.warn(EMOJI, err, err['message']);
        this._nunjucksTemplate = null;
      }
    }
    this._updateRequested.emit(void 0);
  }

  protected onColumnNameChange(change?: any) {
    this._updateRequested.emit(void 0);
  }

  protected getNodeAttr(options: INodeBehaveOptions): string | null {
    const { _nunjucksTemplate } = this;

    if (_nunjucksTemplate != null) {
      try {
        return _nunjucksTemplate.render(options);
      } catch (err) {
        console.warn(EMOJI, err);
      }
    }

    const columnName = this.getColumnName(options.view);

    let color = null;

    if (columnName != null) {
      color = options.node[columnName];
    }

    return color || null;
  }
}
