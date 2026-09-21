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

import clsx from 'clsx';
import { forwardRef, useMemo } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';

import { breakpointKeys, mergeResponsiveValues, resolveResponsiveValue } from '../system/responsive';
import type { ResponsiveValue } from '../system/responsive';
import { resolveSpacing } from '../system/spacing';
import type { SpacingToken } from '../system/spacing';

import './box.css';

export type { SpacingToken } from '../system/spacing';
export type { ResponsiveValue } from '../system/responsive';

export interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  display?: ResponsiveValue<CSSProperties['display']>;
  p?: ResponsiveValue<SpacingToken>;
  px?: ResponsiveValue<SpacingToken>;
  py?: ResponsiveValue<SpacingToken>;
  m?: ResponsiveValue<SpacingToken>;
  mx?: ResponsiveValue<SpacingToken>;
  my?: ResponsiveValue<SpacingToken>;
  gap?: ResponsiveValue<SpacingToken>;
  flexDirection?: ResponsiveValue<CSSProperties['flexDirection']>;
  alignItems?: ResponsiveValue<CSSProperties['alignItems']>;
  justifyContent?: ResponsiveValue<CSSProperties['justifyContent']>;
  flexWrap?: ResponsiveValue<CSSProperties['flexWrap']>;
  flex?: ResponsiveValue<CSSProperties['flex']>;
  width?: ResponsiveValue<CSSProperties['width']>;
  height?: ResponsiveValue<CSSProperties['height']>;
  overflow?: ResponsiveValue<CSSProperties['overflow']>;
}

type BoxStyle = CSSProperties & Record<`--ps-box-${string}`, string | number | undefined>;

function toCssValue(value: string | number | undefined, unit?: 'px'): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return typeof value === 'number' && unit === 'px' ? `${value}px` : String(value);
}

function setResponsiveValue<T extends string | number>(
  style: BoxStyle,
  property: string,
  value: ResponsiveValue<T> | undefined,
  transform: (currentValue: T) => string = String,
): void {
  const resolved = resolveResponsiveValue(value);
  for (const breakpoint of breakpointKeys) {
    const currentValue = resolved[breakpoint];
    if (currentValue !== undefined) {
      style[`--ps-box-${property}-${breakpoint}`] = transform(currentValue);
    }
  }
}

export const Box = forwardRef<HTMLDivElement, BoxProps>(function Box(
  {
    display,
    p,
    px,
    py,
    m,
    mx,
    my,
    gap,
    flexDirection,
    alignItems,
    justifyContent,
    flexWrap,
    flex,
    width,
    height,
    overflow,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const computedStyle = useMemo((): BoxStyle => {
    const result: BoxStyle = { ...style };
    setResponsiveValue(result, 'display', display);
    setResponsiveValue(result, 'flex-direction', flexDirection);
    setResponsiveValue(result, 'align-items', alignItems);
    setResponsiveValue(result, 'justify-content', justifyContent);
    setResponsiveValue(result, 'flex-wrap', flexWrap);
    setResponsiveValue(result, 'flex', flex);
    setResponsiveValue(result, 'width', width, (value) => toCssValue(value, 'px') ?? '');
    setResponsiveValue(result, 'height', height, (value) => toCssValue(value, 'px') ?? '');
    setResponsiveValue(result, 'overflow', overflow);

    if (style?.gap === undefined) {
      setResponsiveValue(result, 'row-gap', gap, (value) => resolveSpacing(value) ?? '');
      setResponsiveValue(result, 'column-gap', gap, (value) => resolveSpacing(value) ?? '');
    }
    if (style?.padding === undefined) {
      setResponsiveValue(result, 'padding-left', mergeResponsiveValues(px, p), (value) => resolveSpacing(value) ?? '');
      setResponsiveValue(result, 'padding-right', mergeResponsiveValues(px, p), (value) => resolveSpacing(value) ?? '');
      setResponsiveValue(result, 'padding-top', mergeResponsiveValues(py, p), (value) => resolveSpacing(value) ?? '');
      setResponsiveValue(
        result,
        'padding-bottom',
        mergeResponsiveValues(py, p),
        (value) => resolveSpacing(value) ?? '',
      );
    }
    if (style?.margin === undefined) {
      setResponsiveValue(result, 'margin-left', mergeResponsiveValues(mx, m), (value) => resolveSpacing(value) ?? '');
      setResponsiveValue(result, 'margin-right', mergeResponsiveValues(mx, m), (value) => resolveSpacing(value) ?? '');
      setResponsiveValue(result, 'margin-top', mergeResponsiveValues(my, m), (value) => resolveSpacing(value) ?? '');
      setResponsiveValue(result, 'margin-bottom', mergeResponsiveValues(my, m), (value) => resolveSpacing(value) ?? '');
    }

    return result;
  }, [
    display,
    flexDirection,
    alignItems,
    justifyContent,
    flexWrap,
    flex,
    width,
    height,
    overflow,
    gap,
    p,
    px,
    py,
    m,
    mx,
    my,
    style,
  ]);

  return (
    <div ref={ref} {...rest} className={clsx('ps-Box', className)} style={computedStyle}>
      {children}
    </div>
  );
});
