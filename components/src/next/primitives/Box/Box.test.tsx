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

import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import type { CSSProperties } from 'react';

import { Box } from './Box';

const colorStyle: CSSProperties = { color: 'red' };
const paddingStyle: CSSProperties = { padding: '99px' };
const spacingStyle: CSSProperties = { padding: '1px 2px 3px 4px', margin: '5px 6px 7px 8px' };
const updatedSpacingStyle: CSSProperties = { padding: '9px 10px', margin: '11px 12px' };
const sideStyle: CSSProperties = { paddingLeft: '9px', marginBottom: '10px' };
const columnGapStyle: CSSProperties = { columnGap: '9px' };
const gapStyle: CSSProperties = { gap: '2px 4px' };
const sideGapStyle: CSSProperties = { ...sideStyle, ...columnGapStyle };
const responsiveLayout = {
  display: { xs: 'flex', md: 'block' },
  flexDirection: { xs: 'column', md: 'row' },
  p: { xs: 'sm', md: 'lg' },
  width: { sm: 320, lg: '50%' },
} as const;
const responsiveAxisSpacing = {
  p: { xs: 'sm', md: 'lg' },
  px: { sm: 'xl', lg: 'xs' },
  m: { xs: 'md', lg: '2xl' },
  my: { md: '0' },
} as const;
const responsiveSpacing = { p: { xs: 'sm', md: 'lg' }, display: { md: 'flex' } } as const;

function expectVariable(element: HTMLElement, property: string, value: string): void {
  expect(element.style.getPropertyValue(`--ps-box-${property}`)).toBe(value);
}

function expectAllBreakpoints(element: HTMLElement, property: string, value: string): void {
  for (const breakpoint of ['xs', 'sm', 'md', 'lg', 'xl']) {
    expectVariable(element, `${property}-${breakpoint}`, value);
  }
}

describe('Box', () => {
  it('renders children and merges classes', () => {
    render(
      <Box data-testid="box" className="custom">
        Content
      </Box>,
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByTestId('box')).toHaveClass('ps-Box', 'custom');
  });

  it('renders as a div by default', () => {
    render(<Box data-testid="box">Content</Box>);
    expect(screen.getByTestId('box').tagName).toBe('DIV');
  });

  it('does not render a style attribute without style-affecting props', () => {
    render(<Box data-testid="box">Content</Box>);
    expect(screen.getByTestId('box')).not.toHaveAttribute('style');
  });

  it('forwards a ref to the underlying div', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Box ref={ref}>Content</Box>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('resolves scalar layout values for every breakpoint', () => {
    render(
      <Box data-testid="box" display="flex" p="md" px="lg" py="sm" m="xl" gap="0">
        Content
      </Box>,
    );

    const box = screen.getByTestId('box');
    expectAllBreakpoints(box, 'display', 'flex');
    expectAllBreakpoints(box, 'padding-left', 'var(--perses-spacing-lg)');
    expectAllBreakpoints(box, 'padding-right', 'var(--perses-spacing-lg)');
    expectAllBreakpoints(box, 'padding-top', 'var(--perses-spacing-sm)');
    expectAllBreakpoints(box, 'padding-bottom', 'var(--perses-spacing-sm)');
    expectAllBreakpoints(box, 'margin-left', 'var(--perses-spacing-xl)');
    expectAllBreakpoints(box, 'row-gap', 'var(--perses-spacing-0)');
    expectAllBreakpoints(box, 'column-gap', 'var(--perses-spacing-0)');
  });

  it('carries responsive values forward to larger breakpoints', () => {
    render(
      <Box data-testid="box" {...responsiveLayout}>
        Content
      </Box>,
    );

    const box = screen.getByTestId('box');
    expectVariable(box, 'display-xs', 'flex');
    expectVariable(box, 'display-sm', 'flex');
    expectVariable(box, 'display-md', 'block');
    expectVariable(box, 'display-xl', 'block');
    expectVariable(box, 'flex-direction-xs', 'column');
    expectVariable(box, 'flex-direction-md', 'row');
    expectVariable(box, 'padding-top-sm', 'var(--perses-spacing-sm)');
    expectVariable(box, 'padding-top-md', 'var(--perses-spacing-lg)');
    expectVariable(box, 'width-xs', '');
    expectVariable(box, 'width-sm', '320px');
    expectVariable(box, 'width-lg', '50%');
  });

  it('applies axis spacing at each breakpoint and falls back to base spacing', () => {
    render(
      <Box data-testid="box" {...responsiveAxisSpacing}>
        Content
      </Box>,
    );

    const box = screen.getByTestId('box');
    expectVariable(box, 'padding-left-xs', 'var(--perses-spacing-sm)');
    expectVariable(box, 'padding-left-sm', 'var(--perses-spacing-xl)');
    expectVariable(box, 'padding-left-md', 'var(--perses-spacing-xl)');
    expectVariable(box, 'padding-left-lg', 'var(--perses-spacing-xs)');
    expectVariable(box, 'padding-top-xs', 'var(--perses-spacing-sm)');
    expectVariable(box, 'padding-top-md', 'var(--perses-spacing-lg)');
    expectVariable(box, 'margin-left-md', 'var(--perses-spacing-md)');
    expectVariable(box, 'margin-left-lg', 'var(--perses-spacing-2xl)');
    expectVariable(box, 'margin-top-xs', 'var(--perses-spacing-md)');
    expectVariable(box, 'margin-top-md', 'var(--perses-spacing-0)');
  });

  it('lets the style prop override generated spacing', () => {
    render(
      <Box data-testid="box" p="md" px="lg" style={paddingStyle}>
        Content
      </Box>,
    );

    const box = screen.getByTestId('box');
    expect(box).toHaveStyle({ padding: '99px' });
    expectVariable(box, 'padding-left-xs', '');
  });

  it('merges style props with generated layout values', () => {
    render(
      <Box data-testid="box" p="sm" style={colorStyle}>
        Content
      </Box>,
    );

    const box = screen.getByTestId('box');
    expect(box).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    expectAllBreakpoints(box, 'padding-top', 'var(--perses-spacing-sm)');
  });

  it('preserves axis overrides when base spacing changes', () => {
    const { rerender } = render(
      <Box data-testid="box" p="md" px="lg" m="md" mx="lg">
        Content
      </Box>,
    );
    rerender(
      <Box data-testid="box" p="sm" px="lg" m="sm" mx="lg">
        Content
      </Box>,
    );

    const box = screen.getByTestId('box');
    expectAllBreakpoints(box, 'padding-top', 'var(--perses-spacing-sm)');
    expectAllBreakpoints(box, 'padding-left', 'var(--perses-spacing-lg)');
    expectAllBreakpoints(box, 'margin-top', 'var(--perses-spacing-sm)');
    expectAllBreakpoints(box, 'margin-left', 'var(--perses-spacing-lg)');
  });

  it('clears obsolete responsive values when props change or are removed', () => {
    const { rerender } = render(
      <Box data-testid="box" {...responsiveSpacing}>
        Content
      </Box>,
    );
    const box = screen.getByTestId('box');
    expectVariable(box, 'padding-top-md', 'var(--perses-spacing-lg)');
    expectVariable(box, 'display-md', 'flex');

    rerender(
      <Box data-testid="box" p="xs">
        Content
      </Box>,
    );
    expectAllBreakpoints(box, 'padding-top', 'var(--perses-spacing-xs)');
    expectVariable(box, 'display-md', '');

    rerender(<Box data-testid="box">Content</Box>);
    expectVariable(box, 'padding-top-xs', '');
    expectVariable(box, 'padding-top-xl', '');
  });

  it('restores generated values after style shorthands are removed', () => {
    const { rerender } = render(
      <Box data-testid="box" p="md" px="lg" m="md" my="xs" style={spacingStyle}>
        Content
      </Box>,
    );
    const box = screen.getByTestId('box');
    expect(box).toHaveStyle({
      paddingTop: '1px',
      paddingRight: '2px',
      paddingBottom: '3px',
      paddingLeft: '4px',
      marginTop: '5px',
      marginRight: '6px',
      marginBottom: '7px',
      marginLeft: '8px',
    });

    rerender(
      <Box data-testid="box" p="md" px="lg" m="md" my="xs" style={updatedSpacingStyle}>
        Content
      </Box>,
    );
    expect(box).toHaveStyle({ paddingTop: '9px', paddingRight: '10px', marginTop: '11px', marginRight: '12px' });

    rerender(
      <Box data-testid="box" p="md" px="lg" m="md" my="xs">
        Content
      </Box>,
    );
    expectAllBreakpoints(box, 'padding-left', 'var(--perses-spacing-lg)');
    expectAllBreakpoints(box, 'padding-top', 'var(--perses-spacing-md)');
    expectAllBreakpoints(box, 'margin-top', 'var(--perses-spacing-xs)');
    expectAllBreakpoints(box, 'margin-left', 'var(--perses-spacing-md)');
  });

  it('preserves individual style-side and gap overrides', () => {
    const { rerender } = render(
      <Box data-testid="box" p="md" px="lg" m="md" gap="md" style={sideGapStyle}>
        Content
      </Box>,
    );
    const box = screen.getByTestId('box');
    expect(box).toHaveStyle({ paddingLeft: '9px', marginBottom: '10px', columnGap: '9px' });
    expectAllBreakpoints(box, 'padding-left', 'var(--perses-spacing-lg)');
    expectAllBreakpoints(box, 'row-gap', 'var(--perses-spacing-md)');
    expectVariable(box, 'column-gap-xs', 'var(--perses-spacing-md)');

    rerender(
      <Box data-testid="box" p="md" px="lg" m="md" gap="lg">
        Content
      </Box>,
    );
    expectAllBreakpoints(box, 'padding-left', 'var(--perses-spacing-lg)');
    expectAllBreakpoints(box, 'margin-bottom', 'var(--perses-spacing-md)');
    expectAllBreakpoints(box, 'column-gap', 'var(--perses-spacing-lg)');
  });

  it('restores token gaps after removing a style shorthand', () => {
    const { rerender } = render(
      <Box data-testid="box" gap="md" style={gapStyle}>
        Content
      </Box>,
    );
    const box = screen.getByTestId('box');
    expect(box).toHaveStyle({ gap: '2px 4px' });

    rerender(
      <Box data-testid="box" gap="md">
        Content
      </Box>,
    );
    expectAllBreakpoints(box, 'row-gap', 'var(--perses-spacing-md)');
    expectAllBreakpoints(box, 'column-gap', 'var(--perses-spacing-md)');
  });
});
