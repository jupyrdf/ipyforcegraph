/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { ISignal, Signal } from '@lumino/signaling';

import { WidgetModel } from '@jupyter-widgets/base';

import { IBehave, IHasGraph } from '../../tokens';

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
