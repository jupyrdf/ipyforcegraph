/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { ObjectHash } from 'backbone';

import {
  IBackboneModelOptions,
  WidgetModel,
  unpack_models as deserialize,
} from '@jupyter-widgets/base';

import { EUpdate, IForce, TAnyForce } from '../../../tokens';
import { LinkColumnOrTemplateModel } from '../base';

export type TForceRecord = Record<string, ForceBehaviorModel | null>;
export class ForceBehaviorModel extends LinkColumnOrTemplateModel implements IForce {
  static model_name = 'ForceBehaviorModel';

  defaults() {
    return {
      ...super.defaults(),
      _model_name: ForceBehaviorModel.model_name,
    };
  }

  initialize(attributes: ObjectHash, options: IBackboneModelOptions): void {
    super.initialize(attributes, options);

    // this.on(this.triggerChanges, () => this._updateRequested.emit(void 0));
    this.on(this.triggerChanges, this.onChanged, this);
  }

  onChanged() {
    console.log(this.triggerChanges, arguments);
    this._updateRequested.emit(void 0);
  }

  forceFactory(): TAnyForce {
    throw new Error('Not implemented');
  }

  get triggerChanges(): string {
    // "change:X change:y"
    return '';
  }

  get force(): TAnyForce {
    return this.forceFactory();
  }
}

export class GraphForcesBehaviorModel extends LinkColumnOrTemplateModel {
  static model_name = 'GraphForcesBehaviorModel';
  static serializers = {
    ...WidgetModel.serializers,
    forces: { deserialize },
  };

  defaults() {
    return {
      ...super.defaults(),
      _model_name: GraphForcesBehaviorModel.model_name,
      forces: {},
    };
  }

  initialize(attributes: ObjectHash, options: IBackboneModelOptions): void {
    super.initialize(attributes, options);
    this.on('change:forces', this.onForcesChange, this);
    this.onForcesChange();
  }

  get forces(): TForceRecord {
    return this.get('forces') || {};
  }

  async onForcesChange(): Promise<void> {
    const { forces, previousForces } = this;

    for (const [key, previous] of Object.entries(previousForces)) {
      if (previous && previous !== forces[key]) {
        previous.updateRequested.disconnect(this.onForceUpdated, this);
      }
    }

    for (const [key, force] of Object.entries(forces)) {
      if (force && force !== previousForces[key]) {
        force.updateRequested.connect(this.onForceUpdated, this);
      }
    }
    this.onForceUpdated();
  }

  get previousForces(): TForceRecord {
    return (this.previous && this.previous('forces')) || {};
  }

  protected onForceUpdated(change?: any) {
    this._updateRequested.emit(EUpdate.Reheat);
  }
}
