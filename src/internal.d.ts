/**
@module internal
This module is for internal use only.
Only import from this module if you're 100% sure you need to, and you're sure you
understand what you're doing.
*/
import { AsciiLowercase, AsciiUppercase, Digit } from "./char";
import { Eq } from "./utils";

export type Derivative<
  P extends string,
  S extends string, // should be specific
> =
  string extends P | S ?
    never // don't consider infinite types
  : P extends "" ?
    never // the prefix literal should be nonempty
  : S extends `${P}${infer R extends string}` ? R
  : never;

type Opt<P extends string, S extends string> =
  [Derivative<P, S>] extends [never] ? S : Derivative<P, S>;

type RecognizeDerivative<P extends string, S extends string> = Eq<
  Derivative<P, S>,
  ""
>;

export type AnyChar<S extends string> =
  S extends `${infer _}${infer R}` ? R : never;

export type Many0<P extends string, S extends string> =
  [Derivative<P, S>] extends [infer R extends string] ?
    [R] extends [never] ?
      S
    : Many0<P, R>
  : never;

export type Many1<P extends string, S extends string> =
  [Derivative<P, S>] extends [infer R extends string] ?
    [R] extends [never] ?
      never
    : Many0<P, R>
  : never;

export type CharClass<RE extends string> =
  RE extends `\\d${infer Rest}` ? Digit | CharClass<Rest>
  : RE extends `0-9${infer Rest}` ? Digit | CharClass<Rest>
  : RE extends `A-Z${infer Rest}` ? AsciiUppercase | CharClass<Rest>
  : RE extends `a-z${infer Rest}` ? AsciiLowercase | CharClass<Rest>
  : RE extends `${infer c}${infer Rest}` ? c | CharClass<Rest>
  : never;

export type NotChars<P extends string, S extends string> =
  S extends "" ? ""
  : S extends `${P}${infer _}` ? never
  : AnyChar<S>;

type OptNotChars<P extends string, S extends string> =
  S extends "" ? ""
  : S extends `${P}${infer _}` ? S
  : AnyChar<S>;

export type Many0NotChars<P extends string, S extends string> =
  S extends "" ? ""
  : S extends `${P}${infer _}` ? S
  : Many0NotChars<P, AnyChar<S>>;

export type Many1NotChars<P extends string, S extends string> =
  S extends "" ? never
  : S extends `${P}${infer _}` ? never
  : Many0NotChars<P, AnyChar<S>>;
