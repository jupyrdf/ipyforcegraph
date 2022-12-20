import { Application, IPlugin } from '@lumino/application';
import { PromiseDelegate } from '@lumino/coreutils';
import { Widget } from '@lumino/widgets';

import { IJupyterWidgetRegistry } from '@jupyter-widgets/base';

import '../style/index.css';

import { DEBUG, EMOJI, NAME, VERSION } from './tokens';
import type * as WidgetExports from './widgets';

const EXTENSION_ID = `${NAME}:plugin`;

const plugin: IPlugin<Application<Widget>, void> = {
  id: EXTENSION_ID,
  requires: [IJupyterWidgetRegistry],
  autoStart: true,
  activate: (app: Application<Widget>, registry: IJupyterWidgetRegistry) => {
    DEBUG && console.warn(`${EMOJI} ${NAME}@${VERSION} loaded`);

    let widgetExports: typeof WidgetExports | null = null;
    let loadingWidgets: PromiseDelegate<void> | null = null;

    registry.registerWidget({
      name: NAME,
      version: VERSION,
      exports: async () => {
        if (widgetExports) {
          return widgetExports;
        } else if (loadingWidgets) {
          await loadingWidgets.promise;
          return widgetExports;
        }

        loadingWidgets = new PromiseDelegate();

        DEBUG && console.warn(`${EMOJI} loading widgets`);
        widgetExports = {
          ...(await import('./widgets')),
        };
        loadingWidgets.resolve(void 0);
        DEBUG && console.warn(`${EMOJI} widgets loaded`, widgetExports);
        return widgetExports;
      },
    });
  },
};

export default [plugin];
