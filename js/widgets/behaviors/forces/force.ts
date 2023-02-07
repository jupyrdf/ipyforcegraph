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
  _force: TAnyForce;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: ForceBehaviorModel.model_name,
    };
  }

  initialize(attributes: ObjectHash, options: IBackboneModelOptions): void {
    super.initialize(attributes, options);

    this._force = this.forceFactory();
    this.on(this.triggerChanges, this.onChanged, this);
  }

  onChanged() {
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
    return this._force;
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
      warmup_ticks: 0,
      cooldown_ticks: -1,
      alpha_min: 0.0,
      alpha_decay: 0.228,
      velocity_decay: 0.4,
    };
  }

  initialize(attributes: ObjectHash, options: IBackboneModelOptions): void {
    super.initialize(attributes, options);
    this.on(
      'change:forces change:cooldown_ticks change:warmup_ticks change:alpha_min change:alpha_decay change:velocity_decay',
      this.onForcesChange,
      this
    );
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

  get warmupTicks(): number {
    return this.get('warmup_ticks');
  }

  get cooldownTicks(): number {
    const ticks = this.get('cooldown_ticks');
    return ticks < 0 ? Infinity : ticks;
  }

  get alphaMin(): number {
    return this.get('alpha_min');
  }

  get alphaDecay(): number {
    return this.get('alpha_decay');
  }

  get velocityDecay(): number {
    return this.get('velocity_decay');
  }
}
