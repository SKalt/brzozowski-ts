import { Quantifier } from "../ir";

/** meta-type: string => [Quantifier, string] | { error: string }  */
export type Parse<
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
      Parse<[Min], Rest>
    : { error: `invalid quantifier: {${Str}` }
  : State extends [infer Min extends number] ?
    Str extends `}${infer Rest}` ? [Quantifier<Min, Min>, Rest]
    : Str extends `${infer Max extends number}}${infer Rest}` ?
      [Quantifier<Min, Max>, Rest]
    : { error: `invalid quantifier: {${Min},${Str}` }
  : never;
