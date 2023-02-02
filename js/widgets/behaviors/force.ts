/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */

import { LinkColumnOrTemplateModel } from './base';

export class ForceBehaviorModel extends LinkColumnOrTemplateModel {
  static model_name = 'ForceBehaviorModel';
    static force:any
    active: boolean
    defaults() {
        return {
          ...super.defaults(),
          _model_name: ForceBehaviorModel.model_name,
          active: true,
        };
      }

    get key():string {
        return this.get("key")
    }

    get force(): (any | null) {
        if (this.get("active")){
            return this.get("force")
        }
        return null
      }
}

