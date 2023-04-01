/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { Environment, Template } from 'nunjucks';

import { PromiseDelegate } from '@lumino/coreutils';

export const MATH_CONST = {
  E: Math.E,
  LN10: Math.LN10,
  LN2: Math.LN2,
  LOG10E: Math.LOG10E,
  LOG2E: Math.LOG2E,
  PI: Math.PI,
  SQRT1_2: Math.SQRT1_2,
  SQRT2: Math.SQRT2,
};

export const MATH_UNARY = [
  Math.acos,
  Math.acosh,
  Math.asin,
  Math.asinh,
  Math.atan,
  Math.atanh,
  Math.cbrt,
  Math.ceil,
  Math.cos,
  Math.cosh,
  Math.exp,
  Math.expm1,
  Math.floor,
  Math.fround,
  Math.log,
  Math.log10,
  Math.log1p,
  Math.log2,
  Math.sign,
  Math.sin,
  Math.sinh,
  Math.sqrt,
  Math.tan,
  Math.tanh,
  Math.trunc,
];

export const MATH_BINARY = [Math.imul, Math.atan2];

export const MATH_N_ARY = [Math.min, Math.max, Math.hypot];

namespace Private {
  export let env: Environment | null = null;
  export let loading: PromiseDelegate<Environment> | null = null;
  export let TemplateClass: typeof Template | null = null;
}

export async function newTemplate(src: string): Promise<Template> {
  const env = await nunjucksEnv();
  return new Private.TemplateClass(src, env, null, true);
}

export async function nunjucksEnv(): Promise<Environment> {
  if (Private.env) {
    return Private.env;
  }
  if (Private.loading) {
    await Private.loading.promise;
    return Private.env;
  }
  Private.loading = new PromiseDelegate();
  const nunjucks = await import('nunjucks');
  const env = new nunjucks.Environment();
  // install custom tags
  addCustomGlobals(env);

  // save in namespace
  Private.TemplateClass = nunjucks.Template;
  Private.env = env;
  Private.loading.resolve(env);
  return env;
}

export interface INAryJs {
  (...values: number[]): number;
}

export interface INAryPy {
  (values: number[] | number, ...moreValues: number[]): number;
}

/**
 * Register globals in the environment that can be called by any template.
 */
function addCustomGlobals(env: Environment) {
  for (const [constName, constValue] of Object.entries(MATH_CONST)) {
    env.addGlobal(constName, constValue);
  }
  for (const fn of MATH_UNARY) {
    env.addGlobal(fn.name, fn);
  }
  for (const fn of MATH_BINARY) {
    env.addGlobal(fn.name, fn);
  }
  for (const fn of MATH_N_ARY) {
    env.addGlobal(fn.name, wrapNAry(fn));
  }
  env.addGlobal('now', () => performance.now());
  env.addFilter('where', (iterable: any[], attr: string, value: any) => {
    const results: any[] = [];
    for (const item of iterable) {
      if (item[attr] === value) {
        results.push(item);
      }
    }
    return results;
  });
}

/**
 * Make a `Math` method more like python.
 */
function wrapNAry(jsFn: INAryJs): INAryPy {
  function pyFn(values: number[] | number, ...rest: number[]) {
    return Array.isArray(values) ? jsFn(...values) : jsFn(values, ...rest);
  }
  return pyFn;
}
