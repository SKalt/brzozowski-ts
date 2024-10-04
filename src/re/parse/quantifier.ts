import { Eq } from "../../utils";
import { Quantifier } from "../ir";

/** meta-type: string => [Quantifier, string] | { error: string }  */
export type _ParseQuantifier<
  State extends
    | null // initial state
    | [number], // min recognized
  Str extends string,
> =
  // note: the state is necessary to validate that both min and max are
  // present, numeric, positive, and finite
  Str extends "" ? { error: "unterminated quantifier" }
  : Str extends `-${string}` ? { error: "negative quantifier" }
  : Str extends `Infinity${string}` ? { error: "infinite quantifier" }
  : State extends null ?
    Str extends `}${string}` ? { error: "empty quantifier" }
    : Str extends `${infer Min extends number}}${infer Rest}` ?
      [Quantifier<Min, Min>, Rest]
    : Str extends `${infer Min extends number},}${infer Rest}` ?
      [Quantifier<Min>, Rest]
    : Str extends `${infer Min extends number},${infer Rest}` ?
      _ParseQuantifier<[Min], Rest>
    : { error: `invalid quantifier: {${Str}` }
  : State extends [infer Min extends number] ?
    Str extends `}${infer Rest}` ? [Quantifier<Min, Min>, Rest]
    : Str extends `${infer Max extends number}}${infer Rest}` ?
      [Quantifier<Min, Max>, Rest]
    : { error: `invalid quantifier: {${Min},${Str}` }
  : never;

{
  type Actual = _ParseQuantifier<null, "3}">;
  const _: Eq<Actual, [Quantifier<3, 3>, ""]> = true;
}
{
  type Actual = _ParseQuantifier<null, "3,}">;
  const _: Eq<Actual, [Quantifier<3>, ""]> = true;
}
{
  type Actual = _ParseQuantifier<null, "3,4}">;
  const _: Eq<Actual, [Quantifier<3, 4>, ""]> = true;
}
{
  type Actual = _ParseQuantifier<null, "Infinity}">;
  const _: Eq<Actual, { error: "infinite quantifier" }> = true;
}
{
  type Actual = _ParseQuantifier<null, "-3}">;
  const _: Eq<Actual, { error: "negative quantifier" }> = true;
}
{
  type Actual = _ParseQuantifier<null, "}">;
  const _: Eq<Actual, { error: "empty quantifier" }> = true;
}
{
  type Actual = _ParseQuantifier<[1], "}">;
  const _: Eq<Actual, [Quantifier<1, 1>, ""]> = true;
}
{
  type Actual = _ParseQuantifier<[1], "3}">;
  const _: Eq<Actual, [Quantifier<1, 3>, ""]> = true;
}
