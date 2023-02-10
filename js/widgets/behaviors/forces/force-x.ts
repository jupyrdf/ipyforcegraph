/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceX as d3XForce } from 'd3-force-3d';

import { EMOJI, IBehave, IForce, TAnyForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

const isNumeric = (val: string) : boolean => {
  return !isNaN(Number(val));
}

async function makeTemplate(template:string): Promise<CallableFunction>{
  const nunjucks = await import('nunjucks');
  let newTemplate = await new nunjucks.Template(template);

  const renderTemplate = (options: any) => {
    try {
      return Number(newTemplate.render(options)) || null;
    } catch (err) {
      console.warn(EMOJI, err);
    }
  }
  return renderTemplate
}

export class XForceModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'XForceModel';
  _force: d3XForce;
  x: CallableFunction | Number | null
  strength: CallableFunction | Number | null

  defaults() {
    return {
      ...super.defaults(),
      _model_name: XForceModel.model_name,
      x: null,
      strength:null,
    };
  }

  forceFactory(): d3XForce {
    return d3XForce();
  }

  get triggerChanges(): string {
    return 'change:x change:strength';
  }

  get force(): TAnyForce {
    const { x , strength } = this;

    let force = this._force;
    force = x == null ? force : force.x(x);
    force = strength == null ? force : force.strength(strength);
    return force;
  }

  async onChanged() {
    await this.update_x()
    await this.update_strength()
    this._updateRequested.emit(void 0);
  }

  async update_x(){
    let value = this.get('x');
    if (isNumeric(value)){
      this.x = Number(value)
    } else{
      this.x = await makeTemplate(value)
    }

  }

  async update_strength(){
    let value = this.get('strength');
    if (isNumeric(value)){
      this.strength = Number(value)
    } else {
      this.strength = await makeTemplate(value)
    }
  }
}
