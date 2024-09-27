/**
@module internal
This module is for internal use only.
Only import from this module if you're 100% sure you need to, and you're sure you
understand what you're doing.
*/
import { AsciiLowercase, AsciiUppercase, Digit } from "./char";
import { Eq } from "./utils";

/**
TODO: notes about how this is a Brzozowski derivative
*/
export type Derivative<Prefix extends string, Str extends string> =
  string extends Prefix | Str ? never /* don't consider infinite types */
  : Prefix extends "" ? never /* the prefix literal should be nonempty */
  : Str extends `${Prefix}${infer R extends string}` ? R
  : never;

type Opt<Prefix extends string, Str extends string> =
  [Derivative<Prefix, Str>] extends [never] ? Str : Derivative<Prefix, Str>;

/**
Infers the derivative of the input string `Str` with respect to any single
character. In other words, this chops off the first character of `Str`. If
`Str` is empty, `AnyChar<"">` infers `never`.
*/
export type AnyChar<Str extends string> =
  Str extends `${infer _}${infer Rest}` ? Rest : never;

export type Many0<Prefix extends string, Str extends string> =
  [Derivative<Prefix, Str>] extends [infer Rest extends string] ?
    [Rest] extends [never] ?
      Str
    : Many0<Prefix, Rest>
  : never;

export type Many1<Prefix extends string, Str extends string> =
  [Derivative<Prefix, Str>] extends [infer Rest extends string] ?
    [Rest] extends [never] ?
      never
    : Many0<Prefix, Rest>
  : never;

export type CharClass<Pattern extends string> =
  Pattern extends `\\d${infer Rest}` ? Digit | CharClass<Rest>
  : Pattern extends `0-9${infer Rest}` ? Digit | CharClass<Rest>
  : Pattern extends `A-Z${infer Rest}` ? AsciiUppercase | CharClass<Rest>
  : Pattern extends `a-z${infer Rest}` ? AsciiLowercase | CharClass<Rest>
  : Pattern extends `${infer c}${infer Rest}` ? c | CharClass<Rest>
  : never;

export type NotChars<CharsToAvoid extends string, Str extends string> =
  Str extends "" ? ""
  : Str extends `${CharsToAvoid}${infer _}` ? never
  : AnyChar<Str>;

type OptNotChars<CharsToAvoid extends string, Str extends string> =
  Str extends "" ? ""
  : Str extends `${CharsToAvoid}${infer _}` ? Str
  : AnyChar<Str>;

export type Many0NotChars<CharsToAvoid extends string, Str extends string> =
  Str extends "" ? ""
  : Str extends `${CharsToAvoid}${infer _}` ? Str
  : Many0NotChars<CharsToAvoid, AnyChar<Str>>;

export type Many1NotChars<CharsToAvoid extends string, Str extends string> =
  Str extends "" ? never
  : Str extends `${CharsToAvoid}${infer _}` ? never
  : Many0NotChars<CharsToAvoid, AnyChar<Str>>;
