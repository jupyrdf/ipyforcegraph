/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { Application, IPlugin } from '@lumino/application';
import { PromiseDelegate } from '@lumino/coreutils';
import { Widget } from '@lumino/widgets';

import { IThemeManager } from '@jupyterlab/apputils';

import { IJupyterWidgetRegistry } from '@jupyter-widgets/base';

import '../style/index.css';

import { DEBUG, EMOJI, NAME, VERSION } from './tokens';
import type * as WidgetExports from './widgets';

const EXTENSION_ID = `${NAME}:plugin`;

const plugin: IPlugin<Application<Widget>, void> = {
  id: EXTENSION_ID,
  requires: [IJupyterWidgetRegistry],
  optional: [IThemeManager],
  autoStart: true,
  activate: (
    app: Application<Widget>,
    registry: IJupyterWidgetRegistry,
    themeManager?: IThemeManager
  ) => {
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
        const { initializeZstd } = await import('./widgets/serializers/dataframe');
        await initializeZstd();

        DEBUG && console.warn(`${EMOJI} loading widgets`);
        const exports = {
          ...(await import('./widgets')),
        };

        const themeUtils = await import('./theme-utils');
        themeUtils.setThemeManager(themeManager);

        widgetExports = exports;
        loadingWidgets.resolve(void 0);
        DEBUG && console.warn(`${EMOJI} widgets loaded`, widgetExports);
        return widgetExports;
      },
    });
  },
};

export default [plugin];
