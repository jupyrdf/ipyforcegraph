/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IThemeManager } from '@jupyterlab/apputils';

import { EMOJI } from './tokens';

namespace Private {
  export let themeManager: IThemeManager | null = null;
  let _themeVars: Record<string, string> = {};
  export function onThemeChanged() {
    if (!themeManager) {
      return;
    }
    _themeVars = {};
  }
  export function getCssVar(varName: string) {
    if (_themeVars[varName] == null) {
      _themeVars[varName] = window
        .getComputedStyle(document.body)
        .getPropertyValue(varName);
    }
    return _themeVars[varName];
  }
}

export function getThemeManager(): IThemeManager | null {
  return Private.themeManager;
}

export function setThemeManager(themeManager: IThemeManager) {
  if (Private.themeManager) {
    console.warn(`${EMOJI} theme manager already registered, ignoring`, themeManager);
    return;
  }
  Private.themeManager = themeManager;
  if (themeManager) {
    themeManager.themeChanged.connect(Private.onThemeChanged);
  }
}

export const CSS_VAR = new RegExp(/var\s*\(\s*(--[^\)]+)\s*\)/, 'g');

export function cssVarReplacer(
  searchValue: string | RegExp,
  varName: string,
  offset: number,
  string: any,
  groups: any
): string {
  return Private.getCssVar(varName);
}

export function replaceCssVars(value: any) {
  return typeof value === 'string' ? value.replaceAll(CSS_VAR, cssVarReplacer) : value;
}
