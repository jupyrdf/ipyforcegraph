/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
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
  }

  get wrapped(): DynamicModel {
    return this.get('wrapped');
  }

  get previousWrapped(): DynamicModel | null {
    return (this.previous && this.previous('wrapped')) || null;
  }

  protected wrappedChanged() {
    const { wrapped, previousWrapped } = this;
    if (previousWrapped) {
      previousWrapped.updateRequested.disconnect(this.valueChanged, this);
    }
    wrapped.updateRequested.connect(this.valueChanged, this);
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
    await wrapped.ensureHandlers();
    this._nodeHandler = (opts: any) => {
      const value = (opts.node[columnName] = wrapped.nodeHandler(opts));
      return value;
    };
    this._linkHandler = (opts: any) => {
      const value = (opts.link[columnName] = wrapped.linkHandler(opts));
      return value;
    };
  }
}

export class ReplaceCssVariablesModel extends WrapperModel {
  static model_name = 'ReplaceCssVariablesModel';

  async ensureHandlers(): Promise<void> {
    if (this._nodeHandler) {
      return;
    }
    const { wrapped } = this;
    await wrapped.ensureHandlers();
    this._nodeHandler = (opts: any) => replaceCssVars(wrapped.nodeHandler(opts));
    this._linkHandler = (opts: any) => replaceCssVars(wrapped.linkHandler(opts));
  }
}
