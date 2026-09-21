// Copyright The Perses Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { breakpoints } from '@perses-dev/design-tokens';
import type { Breakpoint } from '@perses-dev/design-tokens';

export const breakpointKeys = Object.keys(breakpoints) as Breakpoint[];

export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

export function resolveResponsiveValue<T>(value: ResponsiveValue<T> | undefined): Partial<Record<Breakpoint, T>> {
  if (value === undefined) {
    return {};
  }

  if (typeof value !== 'object' || value === null) {
    return Object.fromEntries(breakpointKeys.map((breakpoint) => [breakpoint, value])) as Record<Breakpoint, T>;
  }

  const responsiveValue = value as Partial<Record<Breakpoint, T>>;
  let previousValue: T | undefined;
  const resolved: Partial<Record<Breakpoint, T>> = {};
  for (const breakpoint of breakpointKeys) {
    const currentValue = responsiveValue[breakpoint];
    if (currentValue !== undefined) {
      previousValue = currentValue;
    }
    if (previousValue !== undefined) {
      resolved[breakpoint] = previousValue;
    }
  }
  return resolved;
}

export function mergeResponsiveValues<T>(
  primary: ResponsiveValue<T> | undefined,
  fallback: ResponsiveValue<T> | undefined,
): Partial<Record<Breakpoint, T>> {
  const resolvedPrimary = resolveResponsiveValue(primary);
  const resolvedFallback = resolveResponsiveValue(fallback);
  const resolved: Partial<Record<Breakpoint, T>> = {};

  for (const breakpoint of breakpointKeys) {
    const value = resolvedPrimary[breakpoint] ?? resolvedFallback[breakpoint];
    if (value !== undefined) {
      resolved[breakpoint] = value;
    }
  }

  return resolved;
}
