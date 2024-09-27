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

export type DeriveWRTRegExp<RegExpr extends string, Str extends string> =
  string extends Str ? `${Str} is infinite, so it cannot match ${RegExpr}`
  : RegExpr extends "" ? Str
  : Str extends "" ? never
  : RegExpr extends `[^${infer P}]*${infer Rest}` ?
    DeriveWRTRegExp<Rest, Many0NotChars<CharClass<P>, Str>>
  : RegExpr extends `[^${infer P}]+${infer Rest}` ?
    DeriveWRTRegExp<Rest, Many1NotChars<CharClass<P>, Str>>
  : RegExpr extends `[^${infer P}]?${infer Rest}` ?
    DeriveWRTRegExp<Rest, OptNotChars<CharClass<P>, Str>>
  : RegExpr extends `[^${infer P}]${infer Rest}` ?
    DeriveWRTRegExp<Rest, NotChars<CharClass<P>, Str>>
  : RegExpr extends `[${infer P}]+${infer Rest}` ?
    DeriveWRTRegExp<Rest, Many1<CharClass<P>, Str>>
  : RegExpr extends `[${infer P}]?${infer Rest}` ?
    DeriveWRTRegExp<Rest, Opt<CharClass<P>, Str>>
  : RegExpr extends `[${infer P}]${infer Rest}` ?
    DeriveWRTRegExp<Rest, Derivative<CharClass<P>, Str>>
  : RegExpr extends `(${infer P})*${infer Rest}` ?
    DeriveWRTRegExp<Rest, Many0<P, Str>>
  : RegExpr extends `(${infer P})+${infer Rest}` ?
    DeriveWRTRegExp<Rest, Many1<P, Str>>
  : RegExpr extends `(${infer P})?${infer Rest}` ?
    DeriveWRTRegExp<Rest, Opt<P, Str>>
  : RegExpr extends `.${infer Rest}` ? DeriveWRTRegExp<Rest, AnyChar<Str>>
  : RegExpr extends `${infer P}${infer Rest}` ?
    DeriveWRTRegExp<Rest, Derivative<P, Str>>
  : never;

export type IsCompleteMatch<RegExpr extends string, Str extends string> = Eq<
  DeriveWRTRegExp<RegExpr, Str>,
  ""
>;
