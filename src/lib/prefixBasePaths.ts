type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function prefixString(basePath: string, value: string) {
  if (!value.startsWith('/')) return value;
  if (value.startsWith('//')) return value;
  return `${basePath}${value.slice(1)}`;
}

export function prefixBasePaths<T>(input: T, basePath = '/'): T {
  const normalizedBasePath = basePath.endsWith('/') ? basePath : `${basePath}/`;

  if (typeof input === 'string') {
    return prefixString(normalizedBasePath, input) as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => prefixBasePaths(item, normalizedBasePath)) as T;
  }

  if (isPlainObject(input)) {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, prefixBasePaths(value, normalizedBasePath)])
    ) as T;
  }

  return input;
}
