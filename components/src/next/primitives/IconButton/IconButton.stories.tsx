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
import type { ReactElement } from 'react';
import { useState } from 'react';

import type { ButtonColor, ButtonSize, ButtonVariant } from '../Button/Button';
import { IconButton } from './IconButton';

const variants: ButtonVariant[] = ['solid', 'outline', 'ghost'];
const colors: ButtonColor[] = ['primary', 'secondary', 'error', 'warning', 'success', 'info'];
const sizes: ButtonSize[] = ['sm', 'md', 'lg'];

function CloseIcon(): ReactElement {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor">
      <path d="m6 6 12 12M18 6 6 18" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DeleteIcon(): ReactElement {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export const AllVariantsAndColors: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    {sizes.map((size) => (
      <div key={size}>
        <h3 style={{ marginBottom: '0.5rem' }}>Size: {size}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {variants.map((variant) => (
            <div key={variant} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ width: '4rem', fontSize: '0.75rem' }}>{variant}</span>
              {colors.map((color) => (
                <IconButton
                  key={color}
                  aria-label={`${variant} ${color} close`}
                  variant={variant}
                  color={color}
                  size={size}
                >
                  <CloseIcon />
                </IconButton>
              ))}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
AllVariantsAndColors.storyName = 'All Variants & Colors';

export const Disabled: Story = () => (
  <div style={{ display: 'flex', gap: '1rem' }}>
    <IconButton aria-label="Solid disabled close" variant="solid" color="primary" disabled>
      <CloseIcon />
    </IconButton>
    <IconButton aria-label="Outline disabled close" variant="outline" color="primary" disabled>
      <CloseIcon />
    </IconButton>
    <IconButton aria-label="Ghost disabled close" variant="ghost" color="primary" disabled>
      <CloseIcon />
    </IconButton>
  </div>
);

export const WithClickHandler: Story = () => {
  const [clearCount, setClearCount] = useState(0);
  const onClear = (): void => setClearCount((count) => count + 1);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <IconButton aria-label="Clear" onClick={onClear}>
        <DeleteIcon />
      </IconButton>
      <span>Cleared {clearCount} times</span>
    </div>
  );
};
WithClickHandler.storyName = 'Nested Icon with onClick';
