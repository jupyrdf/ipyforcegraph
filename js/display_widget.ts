// import { Signal } from '@lumino/signaling';
import {
  DOMWidgetModel,
  DOMWidgetView, // unpack_models as deserialize,
} from '@jupyter-widgets/base';

import { NAME, VERSION } from './tokens';

export class ForceGraphViewerModel extends DOMWidgetModel {
  static model_name = 'ForceGraphViewerModel';
  static serializers = {
    ...DOMWidgetModel.serializers,
  };

  defaults() {
    let defaults = {
      ...super.defaults(),

      _model_name: ForceGraphViewerModel.model_name,
      _model_module_version: VERSION,
      _view_module: NAME,
      _view_name: ForceGraphViewerView.view_name,
      _view_module_version: VERSION,
      symbols: {},
      source: null,
      control_overlay: null,
    };
    return defaults;
  }

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);
  }
}

export class ForceGraphViewerView extends DOMWidgetView {
  static view_name = 'ForceGraphViewerView';

  initialize(parameters: any) {
    super.initialize(parameters);
  }
}
