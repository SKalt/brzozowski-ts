import { Digit, Whitespace, Word } from "./char";
import {
  _CheckFinite,
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

// TODO: nicer name?
export type DeriveWRTRegExp<RegExpr extends string, Str extends string> =
  _CheckFinite<Str> extends { error: infer E } ? { error: E }
  : RegExpr extends "" ? Str
  : Str extends "" ? never
  : RegExpr extends `\\d+${infer Rest}` ?
    DeriveWRTRegExp<Rest, Many1<Digit, Str>>
  : RegExpr extends `\\d*${infer Rest}` ?
    DeriveWRTRegExp<Rest, Many0<Digit, Str>>
  : RegExpr extends `\\d?${infer Rest}` ? DeriveWRTRegExp<Rest, Opt<Digit, Str>>
  : RegExpr extends `\\d${infer Rest}` ?
    DeriveWRTRegExp<Rest, Derivative<Digit, Str>>
  : RegExpr extends `\\s+${infer Rest}` ?
    DeriveWRTRegExp<Rest, Many1<Whitespace, Str>>
  : RegExpr extends `\\s*${infer Rest}` ?
    DeriveWRTRegExp<Rest, Many0<Whitespace, Str>>
  : RegExpr extends `\\s?${infer Rest}` ?
    DeriveWRTRegExp<Rest, Opt<Whitespace, Str>>
  : RegExpr extends `\\s${infer Rest}` ?
    DeriveWRTRegExp<Rest, Derivative<Whitespace, Str>>
  : RegExpr extends `\\w+${infer Rest}` ?
    DeriveWRTRegExp<Rest, Many1<Word, Str>>
  : RegExpr extends `\\w*${infer Rest}` ?
    DeriveWRTRegExp<Rest, Many0<Word, Str>>
  : RegExpr extends `\\w?${infer Rest}` ? DeriveWRTRegExp<Rest, Opt<Word, Str>>
  : RegExpr extends `\\w${infer Rest}` ?
    DeriveWRTRegExp<Rest, Derivative<Word, Str>>
  : RegExpr extends `[^${infer P}]*${infer Rest}` ?
    DeriveWRTRegExp<Rest, Many0NotChars<CharClass<P>, Str>>
  : RegExpr extends `[^${infer P}]+${infer Rest}` ?
    DeriveWRTRegExp<Rest, Many1NotChars<CharClass<P>, Str>>
  : RegExpr extends `[^${infer P}]?${infer Rest}` ?
    DeriveWRTRegExp<Rest, OptNotChars<CharClass<P>, Str>>
  : RegExpr extends `[^${infer P}]${infer Rest}` ?
    DeriveWRTRegExp<Rest, NotChars<CharClass<P>, Str>>
  : RegExpr extends `[${infer P}]*${infer Rest}` ?
    DeriveWRTRegExp<Rest, Many0<CharClass<P>, Str>>
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
