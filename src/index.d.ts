import {
  AnyChar,
  CharClass,
  Derivative,
  Many0,
  Many0NotChars,
  Many1,
  Many1NotChars,
  NotChars,
  Opt,
  OptNotChars,
} from "./internal";
import { Eq } from "./utils";

export type DeriveWRTRegExp<RE extends string, S extends string> =
  string extends S ? `${S} is infinite, so it cannot match ${RE}`
  : RE extends "" ? S
  : S extends "" ? never
  : RE extends `[^${infer P}]*${infer Rest}` ?
    DeriveWRTRegExp<Rest, Many0NotChars<CharClass<P>, S>>
  : RE extends `[^${infer P}]+${infer Rest}` ?
    DeriveWRTRegExp<Rest, Many1NotChars<CharClass<P>, S>>
  : RE extends `[^${infer P}]?${infer Rest}` ?
    DeriveWRTRegExp<Rest, OptNotChars<CharClass<P>, S>>
  : RE extends `[^${infer P}]${infer Rest}` ?
    DeriveWRTRegExp<Rest, NotChars<CharClass<P>, S>>
  : RE extends `[${infer P}]+${infer Rest}` ?
    DeriveWRTRegExp<Rest, Many1<CharClass<P>, S>>
  : RE extends `[${infer P}]?${infer Rest}` ?
    DeriveWRTRegExp<Rest, Opt<CharClass<P>, S>>
  : RE extends `[${infer P}]${infer Rest}` ?
    DeriveWRTRegExp<Rest, Derivative<CharClass<P>, S>>
  : RE extends `(${infer P})*${infer Rest}` ? DeriveWRTRegExp<Rest, Many0<P, S>>
  : RE extends `(${infer P})+${infer Rest}` ? DeriveWRTRegExp<Rest, Many1<P, S>>
  : RE extends `(${infer P})?${infer Rest}` ? DeriveWRTRegExp<Rest, Opt<P, S>>
  : RE extends `.${infer Rest}` ? DeriveWRTRegExp<Rest, AnyChar<S>>
  : RE extends `${infer P}${infer Rest}` ?
    DeriveWRTRegExp<Rest, Derivative<P, S>>
  : never;

export type IsCompleteMatch<RE extends string, S extends string> = Eq<
  DeriveWRTRegExp<RE, S>,
  ""
>;
