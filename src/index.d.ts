import { AsciiLowercase, AsciiUppercase, Digit } from "./char";
import { Assert, Eq } from "./utils";

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

type _Many<P extends string, S extends string, T> =
  [Derivative<P, S>] extends [infer R extends string] ?
    [R] extends [never] ?
      T
    : _Many<P, R, R>
  : never;

export type Many0<P extends string, S extends string> = _Many<P, S, S>;

export type Many1<P extends string, S extends string> = _Many<P, S, never>;

export type CharClass<RE extends string> =
  RE extends `\\d${infer Rest}` ? Digit | CharClass<Rest>
  : RE extends `0-9${infer Rest}` ? Digit | CharClass<Rest>
  : RE extends `A-Z${infer Rest}` ? AsciiUppercase | CharClass<Rest>
  : RE extends `a-z${infer Rest}` ? AsciiLowercase | CharClass<Rest>
  : RE extends `${infer c}${infer Rest}` ? c | CharClass<Rest>
  : never;

export type DerivePattern<RE extends string, S extends string> =
  string extends S ? `${S} is infinite, so it cannot match ${RE}`
  : RE extends "" ? S
  : S extends "" ? never
  : RE extends `[${infer P}]*${infer Rest}` ?
    DerivePattern<Rest, Many0<CharClass<P>, S>>
  : RE extends `[${infer P}]+${infer Rest}` ?
    DerivePattern<Rest, Many1<CharClass<P>, S>>
  : RE extends `[${infer P}]?${infer Rest}` ?
    DerivePattern<Rest, Opt<CharClass<P>, S>>
  : RE extends `(${infer P})*${infer Rest}` ? DerivePattern<Rest, Many0<P, S>>
  : RE extends `(${infer P})+${infer Rest}` ? DerivePattern<Rest, Many1<P, S>>
  : RE extends `(${infer P})?${infer Rest}` ? DerivePattern<Rest, Opt<P, S>>
  : RE extends `${infer P}${infer Rest}` ? DerivePattern<Rest, Derivative<P, S>>
  : never;

export type RecognizeTotalPattern<RE extends string, S extends string> =
  DerivePattern<RE, S> extends "" ? true : false;
