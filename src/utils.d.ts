// export type Assert<Condition extends true> = Condition
export type Eq<Actual, Expected> =
  [Actual] extends [Expected] ?
    [Expected] extends [Actual] ?
      true
    : false
  : false;

export type FirstChar<Str extends string> =
  Str extends `${infer Char}${string}` ? Char : never;

// vendored from https://github.com/sindresorhus/type-fest/blob/3d473d1f8b0ec5820e1f3aaf7965b68784423778/source/internal/tuple.d.ts#L40
/**
Create a tuple type of the given length `<L>` and fill it with the given type `<Fill>`.

If `<Fill>` is not provided, it will default to `unknown`.

@link https://itnext.io/implementing-arithmetic-within-typescripts-type-system-a1ef140a6f6f
*/
export type BuildTuple<
  L extends number,
  Fill = unknown,
  T extends readonly unknown[] = [],
> = T["length"] extends L ? T : BuildTuple<L, Fill, [...T, Fill]>;

/** check if A is longer than B */
export type TupleGTE<
  A extends readonly [...unknown[]],
  B extends readonly [...unknown[]],
  I extends readonly [...unknown[]] = [],
> =
  A["length"] extends B["length"] ? true
  : I["length"] extends A["length"] ? false
  : I["length"] extends B["length"] ? true
  : TupleGTE<A, B, [...I, I["length"]]>;
