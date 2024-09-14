// export type Assert<Condition extends true> = Condition
export type Assert<Condition extends true> = Condition;
export type Eq<Actual, Expected> = [Actual] extends [Expected]
  ? [Expected] extends [Actual]
    ? true
    : false
  : false;

type _e0 = Assert<Eq<true, true>>;
type _e1 = Assert<Eq<false, false>>;
type _e2 = Assert<Eq<"", "">>;
type _e3 = Assert<Eq<Eq<"a", "b">, false>>;
type _e4 = Assert<Eq<[1, 2], [1, 2]>>;
type _e5 = Assert<Eq<Eq<[1, 2], [2, 1]>, false>>;
