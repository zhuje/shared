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

import type { Story } from '@ladle/react';
import { tokens } from '@perses-dev/design-tokens';
import type { CSSProperties } from 'react';

import { Box } from './Box';
import type { SpacingToken } from './Box';

const spacingTokens: SpacingToken[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];
const responsiveDirection = { xs: 'column', md: 'row' } as const;
const responsiveGap = { xs: 'sm', md: 'lg' } as const;
const responsivePadding = { xs: 'sm', md: 'lg' } as const;

const border = `1px solid ${tokens.border.default}`;
const styles = {
  section: { display: 'flex', flexDirection: 'column', gap: tokens.spacing['2xl'] },
  list: { display: 'flex', flexDirection: 'column', gap: tokens.spacing.md },
  bordered: { border },
  inline: { border, marginRight: tokens.spacing.md },
  surface: { backgroundColor: tokens.bg.surface, color: tokens.text.primary },
  borderedSurface: { border, backgroundColor: tokens.bg.surface, color: tokens.text.primary },
  inset: { backgroundColor: tokens.bg.sunken, padding: tokens.spacing.md },
  aligned: { border, minHeight: '100px' },
  shortItem: { backgroundColor: tokens.bg.surface, color: tokens.text.primary, width: '80px' },
  tallItem: { backgroundColor: tokens.bg.surface, color: tokens.text.primary, padding: tokens.spacing.md },
  combined: {
    border: `2px solid ${tokens.status.primary.border}`,
    backgroundColor: tokens.status.primary.bg,
    borderRadius: tokens.radius.sm,
    maxWidth: '500px',
  },
  sizing: { border: `1px dashed ${tokens.border.default}`, padding: tokens.spacing.md },
} satisfies Record<string, CSSProperties>;

export const BasicBox: Story = () => (
  <Box p="md" style={styles.bordered}>
    This is a basic box with padding.
  </Box>
);
BasicBox.storyName = 'Basic Box';

export const DisplayVariations: Story = () => (
  <div style={styles.section}>
    <div>
      <h3>Display: block</h3>
      <Box display="block" p="md" style={styles.bordered}>
        Block box
      </Box>
    </div>
    <div>
      <h3>Display: flex</h3>
      <Box display="flex" gap="md" p="md" style={styles.bordered}>
        <Box p="md" style={styles.surface}>
          Item 1
        </Box>
        <Box p="md" style={styles.surface}>
          Item 2
        </Box>
      </Box>
    </div>
    <div>
      <h3>Display: inline-block</h3>
      <Box display="inline-block" p="md" style={styles.inline}>
        Inline 1
      </Box>
      <Box display="inline-block" p="md" style={styles.bordered}>
        Inline 2
      </Box>
    </div>
  </div>
);
DisplayVariations.storyName = 'Display Variations';

export const SpacingTokens: Story = () => {
  return (
    <div style={styles.section}>
      <div>
        <h3>Padding Tokens</h3>
        <div style={styles.list}>
          {spacingTokens.map((token) => (
            <Box key={`p-${token}`} p={token} style={styles.borderedSurface}>
              p={'{token}'}: {token}
            </Box>
          ))}
        </div>
      </div>

      <div>
        <h3>Margin Tokens</h3>
        <div style={styles.inset}>
          {spacingTokens.map((token) => (
            <Box key={`m-${token}`} m={token} style={styles.borderedSurface}>
              m={'{token}'}: {token}
            </Box>
          ))}
        </div>
      </div>
    </div>
  );
};
SpacingTokens.storyName = 'Spacing Tokens';

export const DirectionalSpacing: Story = () => (
  <div style={styles.section}>
    <div>
      <h3>Horizontal Padding (px)</h3>
      <Box px="lg" py="sm" style={styles.bordered}>
        Large horizontal, small vertical padding
      </Box>
    </div>

    <div>
      <h3>Vertical Padding (py)</h3>
      <Box px="sm" py="lg" style={styles.bordered}>
        Small horizontal, large vertical padding
      </Box>
    </div>

    <div>
      <h3>Directional Margins (mx, my)</h3>
      <div style={styles.inset}>
        <Box mx="lg" my="md" style={styles.borderedSurface}>
          Large horizontal, medium vertical margin
        </Box>
      </div>
    </div>
  </div>
);
DirectionalSpacing.storyName = 'Directional Spacing';

export const FlexLayout: Story = () => (
  <div style={styles.section}>
    <div>
      <h3>Flex Direction: row (default)</h3>
      <Box display="flex" flexDirection="row" gap="md" p="md" style={styles.bordered}>
        <Box p="md" flex="1" style={styles.surface}>
          Item 1
        </Box>
        <Box p="md" flex="1" style={styles.surface}>
          Item 2
        </Box>
        <Box p="md" flex="1" style={styles.surface}>
          Item 3
        </Box>
      </Box>
    </div>

    <div>
      <h3>Flex Direction: column</h3>
      <Box display="flex" flexDirection="column" gap="md" p="md" style={styles.bordered}>
        <Box p="md" style={styles.surface}>
          Item 1
        </Box>
        <Box p="md" style={styles.surface}>
          Item 2
        </Box>
        <Box p="md" style={styles.surface}>
          Item 3
        </Box>
      </Box>
    </div>

    <div>
      <h3>Align Items: center</h3>
      <Box display="flex" gap="md" alignItems="center" p="md" style={styles.aligned}>
        <Box style={styles.shortItem}>Short</Box>
        <Box style={styles.tallItem}>
          This is taller
          <br />
          content
        </Box>
      </Box>
    </div>

    <div>
      <h3>Justify Content: space-between</h3>
      <Box display="flex" justifyContent="space-between" p="md" style={styles.bordered}>
        <Box p="md" style={styles.surface}>
          Left
        </Box>
        <Box p="md" style={styles.surface}>
          Center
        </Box>
        <Box p="md" style={styles.surface}>
          Right
        </Box>
      </Box>
    </div>
  </div>
);
FlexLayout.storyName = 'Flex Layout';

export const Responsive: Story = () => (
  <div style={styles.section}>
    <h3>Responsive Layout</h3>
    <Box
      display="flex"
      flexDirection={responsiveDirection}
      gap={responsiveGap}
      p={responsivePadding}
      m="md"
      style={styles.combined}
    >
      <Box display="flex" gap="md" alignItems="center">
        <Box p="md" flex="1" style={styles.surface}>
          Header
        </Box>
        <Box p="md" style={styles.surface}>
          Badge
        </Box>
      </Box>

      <Box p="md" style={styles.surface}>
        <p>This is the main content of the box component.</p>
        <p>It demonstrates how multiple props work together.</p>
      </Box>

      <Box display="flex" gap="md">
        <Box p="md" flex="1" style={styles.surface}>
          Cancel
        </Box>
        <Box p="md" flex="1" style={styles.surface}>
          Submit
        </Box>
      </Box>
    </Box>
  </div>
);
Responsive.storyName = 'Combined Props';

export const ZeroSpacing: Story = () => (
  <Box p="0" style={styles.bordered}>
    This box has zero padding (no space inside border).
  </Box>
);
ZeroSpacing.storyName = 'Zero Spacing';

export const Sizing: Story = () => (
  <div style={styles.section}>
    <div>
      <h3>Fixed Width and Height</h3>
      <Box width="200px" height="100px" style={styles.borderedSurface}>
        200px x 100px
      </Box>
    </div>

    <div>
      <h3>Percentage Width</h3>
      <div style={styles.sizing}>
        <Box width="50%" height="60px" style={styles.borderedSurface}>
          50% width
        </Box>
      </div>
    </div>

    <div>
      <h3>Width Only (height determined by content)</h3>
      <Box width="300px" p="md" style={styles.borderedSurface}>
        This box has a fixed width of 300px, but its height grows to fit the content inside it.
      </Box>
    </div>
  </div>
);
Sizing.storyName = 'Sizing';
