import { WidgetModel, unpack_models as deserialize } from '@jupyter-widgets/base';

import { DEBUG, EMOJI, WIDGET_DEFAULTS } from '../tokens';

/**
 * A model which wraps an `ndarray.NdArray` of indices in `force-graph.GraphData.nodes`.
 */
export class NodeSelectionModel extends WidgetModel {
  static model_name = 'NodeSelectionModel';
  static serializers = {
    ...WidgetModel.serializers,
    value: { deserialize },
  };

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: NodeSelectionModel.model_name,
      value: null,
      multiple: true,
    };
  }

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);
    DEBUG && console.warn(`${EMOJI} selection initialized...`);
  }
}
