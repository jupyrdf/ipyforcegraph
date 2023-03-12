/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { ECoerce, FALSEY } from './tokens';

export function noop(...args: any[]): null {
  return null;
}

export function yes(): true {
  return true;
}

export function identity<T>(value: T): T {
  return value;
}

export function isNumeric(val: string): boolean {
  return !isNaN(Number(val));
}

export function functor(value: any) {
  return () => value;
}

export function coerceBoolish(value: string): boolean {
  return !FALSEY.includes(value.toLocaleLowerCase().trim());
}

export function coerceNumber(value: string): number {
  return Number(value);
}

export function coerceArray(value: string): any[] {
  try {
    value = JSON.parse(value);
  } catch (e) {
    console.debug('could not parse ', value, ' as JSON');
    value = null;
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [];
}

export function getCoercer(coerce: ECoerce): (value: any) => any {
  switch (coerce) {
    case ECoerce.boolish:
      return coerceBoolish;
    case ECoerce.numeric:
      return coerceNumber;
    case ECoerce.array:
      return coerceArray;
    default:
      return identity;
  }
}
