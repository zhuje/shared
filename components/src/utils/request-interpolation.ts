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

import { RequestHeaders } from '@perses-dev/client';
import { replaceVariables, VariableStateMap } from './variable-interpolation';

export type QueryParamValues = Record<string, string | string[]>;

// Regular expression to match variable references (with or without format specifiers)
const VARIABLE_FULL_MATCH = /^\$(\w+)$|^\${(\w+)(?:\.([^:^}]+))?(?::([^}]+))?}$/;

/**
 * Expand a single query param value, returning string[] for multi-valued variables
 * when used as pure variable references or with :queryparam formatter in queryParams context
 */
function expandQueryParamValue(value: string | string[], variableState: VariableStateMap): string | string[] {
  if (typeof value !== 'string') return value;

  const match = value.match(VARIABLE_FULL_MATCH);
  if (match) {
    const varName = match[1] || match[2];
    const format = match[4];

    if (varName) {
      const variable = variableState[varName];
      if (variable && Array.isArray(variable.value) && variable.value.length > 1) {
        // For pure variable references or :queryparam formatter in queryParams context,
        // return raw array values to avoid double-encoding
        if (!format || format === 'queryparam') {
          return variable.value.map(String);
        }
      }
      if (variable && variable.value !== undefined) {
        const val = variable.value;
        // For single values or non-queryparam formatters, handle normally
        if (!format || format === 'queryparam') {
          return Array.isArray(val) ? String(val[0]) : String(val);
        }
      }
    }
  }
  return replaceVariables(value, variableState);
}

export function interpolateHeaders(headers: Record<string, string>, variableState: VariableStateMap): RequestHeaders {
  const result: RequestHeaders = {};
  for (const [key, value] of Object.entries(headers)) {
    result[key] = replaceVariables(value, variableState);
  }
  return result;
}

export function interpolateQueryParams(
  queryParams: QueryParamValues,
  variableState: VariableStateMap
): QueryParamValues {
  // DEBUG: Verify package linking - this log confirms the fixed version is being used
  console.log('🔧 [QUERYPARAMS-FIX] interpolateQueryParams called with:', {
    queryParams,
    variables: Object.keys(variableState),
    timestamp: new Date().toISOString()
  });

  const result: QueryParamValues = {};
  for (const [key, value] of Object.entries(queryParams)) {
    if (Array.isArray(value)) {
      result[key] = value.map((v) => replaceVariables(v, variableState));
    } else {
      result[key] = expandQueryParamValue(value, variableState);
    }
  }

  // DEBUG: Show the transformation result
  console.log('🔧 [QUERYPARAMS-FIX] Result:', result);

  return result;
}
