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
import userEvent from '@testing-library/user-event';

import { Checkbox } from '../Checkbox';
import { Select, SelectItem } from '../Select';
import { Switch } from '../Switch';
import { TextField } from '../TextField';
import { FormControl, FormControlLabel, FormHelperText, FormLabel } from './index';

describe('controls nested in a FormControl', () => {
  it('lets the FormControl own the label and helper of a nested TextField that opts in', () => {
    render(
      <FormControl>
        <FormLabel>Outer</FormLabel>
        <TextField labelledByFormControl />
        <FormHelperText>Outer help</FormHelperText>
      </FormControl>,
    );
    const input = screen.getByLabelText('Outer');
    expect(document.querySelectorAll('label')).toHaveLength(1);
    expect(input).toHaveAccessibleDescription('Outer help');
    expect(document.querySelector('.ps-TextField')).not.toHaveClass('ps-FormControl');
  });

  it.each([
    ['TextField', <TextField key="t" label="Inner" helperText="Inner help" />, 'textbox'],
    ['Select', <Select key="s" label="Inner" helperText="Inner help" />, 'combobox'],
  ])('a nested %s without the opt-in keeps its own label and helper', (_name, control, role) => {
    render(
      <FormControl disabled>
        <FormLabel>Outer</FormLabel>
        {control}
        <FormHelperText>Outer help</FormHelperText>
      </FormControl>,
    );
    const element = screen.getByRole(role, { name: 'Inner' });
    expect(screen.getByText('Outer')).toBeInTheDocument();
    expect(element).toHaveAccessibleDescription('Outer help Inner help');
    expect(element.closest('.ps-TextField, .ps-Select')).toHaveAttribute('data-disabled');
  });

  it('a TextField that opts in without a FormLabel has no accessible name', () => {
    render(
      <FormControl>
        <TextField labelledByFormControl />
      </FormControl>,
    );
    expect(screen.getByRole('textbox')).not.toHaveAccessibleName();
  });

  it('names a Perses Checkbox placed inside a FormControl from the FormLabel', () => {
    render(
      <FormControl>
        <FormLabel>Enabled</FormLabel>
        <Checkbox labelledByFormControl />
      </FormControl>,
    );
    expect(screen.getByRole('checkbox')).toHaveAccessibleName('Enabled');
  });

  it('keeps an explicit aria-label on a Checkbox placed inside a FormControl', () => {
    render(
      <FormControl>
        <FormLabel>Enabled</FormLabel>
        <Checkbox aria-label="Enable plugin" />
      </FormControl>,
    );
    expect(screen.getByRole('checkbox')).toHaveAccessibleName('Enable plugin');
  });

  it('links FormLabel and FormHelperText to a TextField with labelledByFormControl', () => {
    render(
      <FormControl status="error">
        <FormLabel>Name</FormLabel>
        <TextField labelledByFormControl placeholder="Type here" />
        <FormHelperText>Name is required</FormHelperText>
      </FormControl>,
    );
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveAccessibleDescription('Name is required');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.closest('.ps-TextField')).toHaveAttribute('data-status', 'error');
  });

  it('TextField inherits size, disabled and required from the FormControl unless set locally', () => {
    render(
      <FormControl size="sm" disabled required>
        <FormLabel>Name</FormLabel>
        <TextField labelledByFormControl />
      </FormControl>,
    );
    const input = screen.getByLabelText(/Name/);
    expect(input).toBeDisabled();
    expect(input).toBeRequired();
    expect(input.closest('.ps-TextField')).toHaveAttribute('data-size', 'sm');
    expect(input.closest('.ps-TextField')).toHaveAttribute('data-disabled');
  });

  it('local size and status win over inherited ones; a disabled FormControl always disables its control', () => {
    render(
      <FormControl size="sm" status="warning" disabled>
        <FormLabel>Name</FormLabel>
        <TextField labelledByFormControl size="lg" status="error" disabled={false} />
      </FormControl>,
    );
    const input = screen.getByLabelText('Name');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.closest('.ps-TextField')).toHaveAttribute('data-size', 'lg');
    expect(input.closest('.ps-TextField')).toHaveAttribute('data-status', 'error');
  });

  it.each([false, true])(
    'a local status="error" on a nested Select (searchable=%s) sets aria-invalid on the trigger',
    (searchable) => {
      render(
        <FormControl>
          <FormLabel>Unit</FormLabel>
          {searchable ? (
            <Select labelledByFormControl searchable status="error" defaultValue="bytes">
              <SelectItem value="bytes">Bytes</SelectItem>
            </Select>
          ) : (
            <Select labelledByFormControl status="error" defaultValue="bytes">
              <SelectItem value="bytes">Bytes</SelectItem>
            </Select>
          )}
        </FormControl>,
      );
      expect(screen.getByRole('combobox', { name: 'Unit' })).toHaveAttribute('aria-invalid', 'true');
    },
  );

  it.each([false, true])(
    'a local disabled on a nested TextField (multiline=%s) disables the input inside an enabled FormControl',
    (multiline) => {
      render(
        <FormControl>
          <FormLabel>Name</FormLabel>
          <TextField labelledByFormControl disabled multiline={multiline} />
        </FormControl>,
      );
      const input = screen.getByLabelText('Name');
      expect(input).toBeDisabled();
      expect(input.closest('.ps-TextField')).toHaveAttribute('data-disabled');
    },
  );

  it.each([false, true])(
    'names a Select (searchable=%s) with labelledByFormControl from the FormLabel',
    (searchable) => {
      render(
        <FormControl disabled>
          <FormLabel>Unit</FormLabel>
          {searchable ? (
            <Select labelledByFormControl searchable defaultValue="bytes" helperText="ignored">
              <SelectItem value="bytes">Bytes</SelectItem>
            </Select>
          ) : (
            <Select labelledByFormControl defaultValue="bytes" helperText="ignored">
              <SelectItem value="bytes">Bytes</SelectItem>
            </Select>
          )}
          <FormHelperText>Pick one</FormHelperText>
        </FormControl>,
      );
      const trigger = screen.getByRole('combobox', { name: 'Unit' });
      expect(trigger).toHaveAccessibleDescription('Pick one');
      expect(screen.queryByText('ignored')).toBeNull();
      expect(document.querySelector('.ps-Select')).toHaveAttribute('data-disabled');
    },
  );

  it('names a Checkbox with labelledByFormControl from FormControlLabel and inherits size', () => {
    render(
      <FormControlLabel label="Allow header sorting">
        <Checkbox labelledByFormControl size="lg" />
      </FormControlLabel>,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Allow header sorting' });
    expect(checkbox).toHaveAttribute('data-size', 'lg');
  });

  it('Switch and Checkbox inherit disabled from FormControlLabel and FormControl', () => {
    render(
      <>
        <FormControlLabel label="Toggle" disabled>
          <Switch labelledByFormControl />
        </FormControlLabel>
        <FormControl size="sm" disabled>
          <FormLabel>Agree</FormLabel>
          <Checkbox labelledByFormControl />
        </FormControl>
      </>,
    );
    expect(screen.getByRole('switch', { name: 'Toggle' })).toHaveAttribute('aria-disabled', 'true');
    const checkbox = screen.getByRole('checkbox', { name: 'Agree' });
    expect(checkbox).toHaveAttribute('aria-disabled', 'true');
    expect(checkbox).toHaveAttribute('data-size', 'sm');
  });

  it('FormControlLabel inside a FormControl keeps the outer disabled, required, size and status', () => {
    render(
      <FormControl disabled required size="sm" status="error">
        <FormControlLabel label="Agree">
          <Checkbox labelledByFormControl />
        </FormControlLabel>
        <FormHelperText>Required</FormHelperText>
      </FormControl>,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Agree' });
    userEvent.click(screen.getByText('Agree'));
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    expect(checkbox).toHaveAttribute('aria-disabled', 'true');
    expect(checkbox).toHaveAttribute('aria-required', 'true');
    expect(checkbox).toHaveAttribute('data-size', 'sm');
    expect(checkbox).toHaveAccessibleDescription('Required');
  });

  it.each([
    ['TextField', <TextField key="t" labelledByFormControl disabled={false} />, 'textbox', '.ps-TextField'],
    ['Checkbox', <Checkbox key="c" labelledByFormControl disabled={false} />, 'checkbox', '.ps-Checkbox'],
    ['Switch', <Switch labelledByFormControl key="s" disabled={false} />, 'switch', '.ps-Switch'],
    [
      'Select',
      <Select key="l" labelledByFormControl disabled={false} defaultValue="a">
        <SelectItem value="a">A</SelectItem>
      </Select>,
      'combobox',
      '.ps-Select',
    ],
  ])('disabled={false} on a nested %s cannot re-enable a disabled FormControl', (_name, control, role, root) => {
    render(
      <FormControl disabled>
        <FormLabel>Name</FormLabel>
        {control}
      </FormControl>,
    );
    const element = screen.getByRole(role, { name: 'Name' });
    expect(element.closest(root)).toHaveAttribute('data-disabled');
    expect(element.matches(':disabled, [aria-disabled="true"]')).toBe(true);
  });

  it('FormControlLabel disabled wins over an enabled FormControl', () => {
    render(
      <FormControl>
        <FormControlLabel label="Agree" disabled>
          <Checkbox labelledByFormControl />
        </FormControlLabel>
      </FormControl>,
    );
    expect(screen.getByRole('checkbox', { name: 'Agree' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('labelledByFormControl is exclusive with label and aria-label at the type level', () => {
    render(
      <FormControl>
        <FormLabel>Name</FormLabel>
        {/* @ts-expect-error label and labelledByFormControl cannot be combined */}
        <TextField labelledByFormControl label="Dup" />
      </FormControl>,
    );
    expect(document.querySelectorAll('label')).toHaveLength(1);
  });
});
