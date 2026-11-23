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

import { Field } from '@base-ui/react/field';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, forwardRef } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { ComponentsProvider, useComponents } from '../../contexts/ComponentsProvider';
import { Checkbox } from '../Checkbox';
import { defaultComponents, defaultIcons } from '../defaults';
import { Switch } from '../Switch';
import { FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel } from './index';
import type { FormControlLabelProps, FormControlProps } from './index';

const getRoot = (): HTMLElement => document.querySelector('.ps-FormControl') as HTMLElement;
const getLabel = (): HTMLLabelElement => document.querySelector('.ps-FormLabel') as HTMLLabelElement;
const getHelper = (): HTMLElement => document.querySelector('.ps-FormHelperText') as HTMLElement;

function renderField(props: Partial<FormControlProps> = {}, helper?: string): ReturnType<typeof render> {
  return render(
    <FormControl {...props}>
      <FormLabel>Name</FormLabel>
      <Field.Control />
      {helper && <FormHelperText>{helper}</FormHelperText>}
    </FormControl>,
  );
}

describe('FormControl + FormLabel + FormHelperText', () => {
  it('links the label to the control through htmlFor and id', () => {
    renderField();
    const input = screen.getByLabelText('Name');
    expect(input.id).not.toBe('');
    expect(getLabel().htmlFor).toBe(input.id);
  });

  it('keeps an explicit control id and still links the label', () => {
    render(
      <FormControl>
        <FormLabel>Name</FormLabel>
        <Field.Control id="name-input" />
      </FormControl>,
    );
    const input = screen.getByLabelText('Name');
    expect(input).toHaveAttribute('id', 'name-input');
    expect(getLabel().htmlFor).toBe('name-input');
  });

  it('accepts htmlFor for a control that is not registered with the field', () => {
    render(
      <FormControl>
        <FormLabel htmlFor="plain">Plain</FormLabel>
        <input id="plain" />
      </FormControl>,
    );
    expect(screen.getByLabelText('Plain')).toHaveAttribute('id', 'plain');
  });

  it('describes the control with the helper text only when present', () => {
    const { unmount } = renderField({}, 'Must be unique');
    const input = screen.getByLabelText('Name');
    const helper = getHelper();
    expect(helper.id).not.toBe('');
    expect(input).toHaveAttribute('aria-describedby', helper.id);
    expect(input).toHaveAccessibleDescription('Must be unique');
    unmount();

    renderField();
    expect(screen.getByLabelText('Name')).not.toHaveAttribute('aria-describedby');
  });

  it('marks error state on root, label, helper and control', () => {
    renderField({ status: 'error' }, 'Required');
    const input = screen.getByLabelText('Name');
    expect(getRoot()).toHaveAttribute('data-invalid');
    expect(getRoot()).toHaveAttribute('data-status', 'error');
    expect(getLabel()).toHaveAttribute('data-invalid');
    expect(getHelper()).toHaveAttribute('data-invalid');
    expect(getHelper()).toHaveAttribute('data-status', 'error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid for a warning status', () => {
    renderField({ status: 'warning' }, 'Careful');
    expect(screen.getByLabelText('Name')).not.toHaveAttribute('aria-invalid');
    expect(getRoot()).toHaveAttribute('data-status', 'warning');
    expect(getRoot()).not.toHaveAttribute('data-invalid');
    expect(getHelper()).toHaveAttribute('data-status', 'warning');
  });

  it('propagates disabled to root, label and control', () => {
    renderField({ disabled: true });
    expect(getRoot()).toHaveAttribute('data-disabled');
    expect(getLabel()).toHaveAttribute('data-disabled');
    expect(screen.getByLabelText('Name')).toBeDisabled();
  });

  it('flags required on the root without changing the accessible name', () => {
    renderField({ required: true });
    expect(getRoot()).toHaveAttribute('data-required');
    expect(screen.getByLabelText('Name')).toHaveAccessibleName('Name');
    expect(getLabel().textContent).toBe('Name');
  });

  it('exposes size through data-size and defaults to md', () => {
    const { unmount } = renderField();
    expect(getRoot()).toHaveAttribute('data-size', 'md');
    unmount();
    renderField({ size: 'sm' });
    expect(getRoot()).toHaveAttribute('data-size', 'sm');
  });
});

describe('FormGroup', () => {
  it('renders a fieldset named by its legend', () => {
    render(
      <FormGroup legend="Template">
        <Checkbox label="A" />
      </FormGroup>,
    );
    const group = screen.getByRole('group', { name: 'Template' });
    expect(group.tagName).toBe('FIELDSET');
    expect(group.querySelector('legend')).toHaveTextContent('Template');
    expect(group).toHaveClass('ps-FormGroup');
    expect(group.querySelector('legend')).toHaveClass('ps-FormGroup__legend');
  });

  it('maps direction to the flex-direction style prop, including responsive values', () => {
    const { unmount } = render(<FormGroup direction="row">x</FormGroup>);
    let group = screen.getByRole('group');
    expect(group).toHaveClass('ps-flex-direction');
    expect(group).toHaveStyle({ '--ps-flex-direction': 'row' });
    unmount();

    render(<FormGroup direction={{ default: 'column', md: 'row' }}>x</FormGroup>);
    group = screen.getByRole('group');
    expect(group).toHaveStyle({
      '--ps-flex-direction': 'column',
      '--ps-flex-direction-md': 'row',
    });
  });

  it('renders children in order and has no legend wiring without a legend', () => {
    render(
      <FormGroup>
        <Checkbox label="One" />
        <Checkbox label="Two" />
      </FormGroup>,
    );
    const group = screen.getByRole('group');
    expect(group).not.toHaveAttribute('aria-labelledby');
    expect(group.querySelector('legend')).toBeNull();
    const boxes = screen.getAllByRole('checkbox');
    expect(boxes.map((box) => box.getAttribute('aria-labelledby') ?? box.textContent)).toHaveLength(2);
    expect(screen.getAllByText(/One|Two/).map((el) => el.textContent)).toEqual(['One', 'Two']);
  });

  it('disables controls wrapped in nested FormControlLabel and FormControl', () => {
    render(
      <FormGroup legend="Options" disabled>
        <FormControlLabel label="One">
          <Switch labelledByFormControl />
        </FormControlLabel>
        <FormControl>
          <FormLabel>Two</FormLabel>
          <Field.Control />
        </FormControl>
      </FormGroup>,
    );
    expect(screen.getByRole('group')).toBeDisabled();
    expect(screen.getByRole('group')).toHaveAttribute('data-disabled');
    expect(screen.getByRole('switch')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByLabelText('Two')).toBeDisabled();
  });

  it('falsy legend content renders no legend element', () => {
    render(<FormGroup legend="">x</FormGroup>);
    expect(screen.getByRole('group').querySelector('legend')).toBeNull();
  });
});

function renderControlLabel(
  props: Partial<FormControlLabelProps> = {},
  control: ReactElement = <Switch labelledByFormControl />,
): ReturnType<typeof render> {
  return render(
    <FormControlLabel label="Allow header sorting" {...props}>
      {control}
    </FormControlLabel>,
  );
}

describe('FormControlLabel', () => {
  it('toggles a wrapped native checkbox when the label text is clicked', async () => {
    renderControlLabel({}, <Field.Control type="checkbox" />);
    const checkbox = screen.getByRole('checkbox', {
      name: 'Allow header sorting',
    });
    await userEvent.click(screen.getByText('Allow header sorting'));
    expect(checkbox).toBeChecked();
  });

  it('toggles a wrapped Switch when the label text is clicked', async () => {
    renderControlLabel({}, <Switch labelledByFormControl />);
    const toggle = screen.getByRole('switch', { name: 'Allow header sorting' });
    await userEvent.click(screen.getByText('Allow header sorting'));
    expect(toggle).toBeChecked();
  });

  it('does not change a readOnly control', async () => {
    renderControlLabel({}, <Switch labelledByFormControl readOnly />);
    await userEvent.click(screen.getByText('Allow header sorting'));
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it.each([
    ['Checkbox', <Checkbox key="c" aria-label="Select all plugins" />, 'checkbox'],
    ['Switch', <Switch key="s" aria-label="Select all plugins" />, 'switch'],
  ])('an explicit aria-label on a wrapped %s wins over the visible label text', async (_name, control, role) => {
    renderControlLabel({ label: 'Update all' }, control);
    const toggle = screen.getByRole(role, { name: 'Select all plugins' });
    expect(toggle).toHaveAccessibleName('Select all plugins');
    await userEvent.click(screen.getByText('Update all'));
    expect(toggle).toBeChecked();
  });

  it('exposes labelPlacement and defaults to end', () => {
    const { unmount } = renderControlLabel();
    expect(screen.getByText('Allow header sorting').closest('label')).toHaveAttribute('data-label-placement', 'end');
    unmount();
    renderControlLabel({ labelPlacement: 'start' });
    expect(screen.getByText('Allow header sorting').closest('label')).toHaveAttribute('data-label-placement', 'start');
  });

  it('disables the wrapped control and ignores clicks', async () => {
    renderControlLabel({ disabled: true });
    const checkbox = screen.getByRole('switch');
    expect(screen.getByText('Allow header sorting').closest('label')).toHaveAttribute('data-disabled');
    expect(checkbox).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(screen.getByText('Allow header sorting'));
    expect(checkbox).not.toBeChecked();
  });

  it('uses the visible text as the accessible name of the wrapped control', () => {
    renderControlLabel();
    expect(screen.getByRole('switch')).toHaveAccessibleName('Allow header sorting');
  });

  it('renders 0 as label content and nothing for empty content', () => {
    const { unmount } = renderControlLabel({ label: 0 });
    expect(screen.getByText('0')).toHaveClass('ps-FormControlLabel__text');
    unmount();
    renderControlLabel({ label: '' });
    expect(document.querySelector('.ps-FormControlLabel__text')).toBeNull();
  });

  it('keeps the label out of the tab order and toggles with Space', async () => {
    renderControlLabel();
    await userEvent.tab();
    const checkbox = screen.getByRole('switch');
    expect(checkbox).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(checkbox).toBeChecked();
    await userEvent.tab();
    expect(document.body).toHaveFocus();
  });
});

describe('prop combinations', () => {
  it('FormControl merges className and style props and keeps them off the DOM', () => {
    render(
      <FormControl className="custom" p="md" width={200} flex={1} display="inline-flex" data-testid="root">
        <input aria-label="x" />
      </FormControl>,
    );
    const root = screen.getByTestId('root');
    expect(root).toHaveClass('ps-FormControl', 'custom', 'ps-p', 'ps-width', 'ps-flex', 'ps-display');
    expect(root).toHaveStyle({
      '--ps-p': 'var(--perses-spacing-md)',
      '--ps-width': '200px',
      '--ps-flex': '1',
      '--ps-display': 'inline-flex',
    });
    for (const attr of ['p', 'width', 'flex', 'display']) expect(root).not.toHaveAttribute(attr);
  });

  it('FormControl lets style win over computed style and supports responsive values', () => {
    render(
      <FormControl width={{ default: '100%', md: '20rem' }} style={{ '--ps-width': '1px' }} data-testid="root">
        <input aria-label="x" />
      </FormControl>,
    );
    expect(screen.getByTestId('root')).toHaveStyle({
      '--ps-width': '1px',
      '--ps-width-md': '20rem',
    });
  });

  it('FormGroup accepts spacing, sizing, flexbox and display props', () => {
    render(
      <FormGroup m="sm" minWidth={120} gap="xs" display="grid">
        x
      </FormGroup>,
    );
    const group = screen.getByRole('group');
    expect(group).toHaveClass('ps-m', 'ps-min-width', 'ps-gap', 'ps-display');
    expect(group).not.toHaveAttribute('gap');
  });

  it('FormLabel and FormHelperText accept spacing props only', () => {
    render(
      <FormControl>
        <FormLabel mb="xs">Name</FormLabel>
        <Field.Control />
        <FormHelperText mt="sm">Hint</FormHelperText>
      </FormControl>,
    );
    expect(getLabel()).toHaveClass('ps-mb');
    expect(getLabel()).toHaveStyle({ '--ps-mb': 'var(--perses-spacing-xs)' });
    expect(getHelper()).toHaveClass('ps-mt');
    expect(getHelper()).not.toHaveAttribute('mt');
  });

  it('FormLabel rejects sizing props at the type level', () => {
    render(
      <FormControl>
        {/* @ts-expect-error width is not a FormLabel style prop */}
        <FormLabel width={100}>Name</FormLabel>
        <Field.Control />
      </FormControl>,
    );
    expect(getLabel()).not.toHaveClass('ps-width');
  });

  it('FormControl disabled with an onClick still fires the click on the root', async () => {
    const onClick = vi.fn();
    render(
      <FormControl disabled onClick={onClick} data-testid="root">
        <Field.Control />
      </FormControl>,
    );
    await userEvent.click(screen.getByTestId('root'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('FormControlLabel ignores false and null label content', () => {
    render(
      <FormControlLabel label={false}>
        <Checkbox aria-label="Only" />
      </FormControlLabel>,
    );
    expect(document.querySelector('.ps-FormControlLabel__text')).toBeNull();
    expect(screen.getByRole('checkbox')).toHaveAccessibleName('Only');
  });

  it('FormControlLabel merges className and spacing props on the label element', () => {
    render(
      <FormControlLabel label="A" className="custom" mt="md">
        <Switch labelledByFormControl />
      </FormControlLabel>,
    );
    const label = screen.getByText('A').closest('label');
    expect(label).toHaveClass('ps-FormControlLabel', 'custom', 'ps-mt');
    expect(label).not.toHaveAttribute('mt');
  });
});

function FieldOverrideConsumer(): ReactElement {
  const {
    components: {
      FormControl: Control,
      FormLabel: Label,
      FormHelperText: HelperText,
      FormGroup: Group,
      FormControlLabel: ControlLabel,
    },
  } = useComponents();
  return (
    <Group legend="Group">
      <Control>
        <Label>Name</Label>
        <Field.Control />
        <HelperText>Hint</HelperText>
      </Control>
      <ControlLabel label="Toggle">
        <Switch labelledByFormControl />
      </ControlLabel>
    </Group>
  );
}

describe('ComponentsProvider', () => {
  it('renders overrides for every Field part', () => {
    const CustomLabel = forwardRef<HTMLLabelElement, { children?: ReactNode }>(function CustomLabel({ children }, ref) {
      return (
        <label ref={ref} data-testid="custom-label">
          {children}
        </label>
      );
    });

    render(
      <ComponentsProvider components={{ ...defaultComponents, FormLabel: CustomLabel }} icons={defaultIcons}>
        <FieldOverrideConsumer />
      </ComponentsProvider>,
    );

    expect(screen.getByTestId('custom-label')).toHaveTextContent('Name');
    expect(screen.getByRole('group', { name: 'Group' })).toBeInTheDocument();
    expect(screen.getByText('Hint')).toHaveClass('ps-FormHelperText');
    expect(screen.getByRole('switch', { name: 'Toggle' })).toBeInTheDocument();
  });

  it('forwards refs to the underlying elements', () => {
    const control = createRef<HTMLDivElement>();
    const label = createRef<HTMLLabelElement>();
    const helper = createRef<HTMLParagraphElement>();
    const group = createRef<HTMLFieldSetElement>();
    const controlLabel = createRef<HTMLLabelElement>();
    render(
      <FormGroup ref={group}>
        <FormControl ref={control}>
          <FormLabel ref={label}>Name</FormLabel>
          <Field.Control />
          <FormHelperText ref={helper}>Hint</FormHelperText>
        </FormControl>
        <FormControlLabel ref={controlLabel} label="Toggle">
          <Switch labelledByFormControl />
        </FormControlLabel>
      </FormGroup>,
    );
    expect(control.current?.tagName).toBe('DIV');
    expect(label.current?.tagName).toBe('LABEL');
    expect(helper.current?.tagName).toBe('P');
    expect(group.current?.tagName).toBe('FIELDSET');
    expect(controlLabel.current?.tagName).toBe('LABEL');
  });
});
