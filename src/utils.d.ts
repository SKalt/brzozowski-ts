// export type Assert<Condition extends true> = Condition
export type Eq<Actual, Expected> =
  [Actual] extends [Expected] ?
    [Expected] extends [Actual] ?
      true
    : false
  : false;

export type FirstChar<Str extends string> =
  Str extends `${infer Char}${string}` ? Char : never;
