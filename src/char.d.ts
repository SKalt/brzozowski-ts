import { Err } from "./re/ir";

type _Digit = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
type _AsciiLowercase = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];
type _AsciiUppercase = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
type AsUnion<T extends readonly [...string[]]> =
  T extends [] ? never
  : T extends [infer F, ...infer R extends string[]] ? F | AsUnion<R>
  : never;

type FindStart<Min extends string, Range extends readonly [...string[]]> =
  Range extends [] ? never
  : Range extends [Min, ...infer Rest] ? Rest
  : Range extends [infer _, ...infer Rest extends [...string[]]] ?
    FindStart<Min, Rest>
  : never;

type FindEnd<Max extends string, Range extends readonly [...string[]]> =
  Range extends [] ? never
  : Range extends [...infer Rest, Max] ? Rest
  : Range extends [...infer Rest extends [...string[]], infer _] ?
    FindEnd<Max, Rest>
  : never;

type _FindRange<
  Min extends string,
  Max extends string,
  Range extends readonly [...string[]],
> =
  Min extends Max ? Min
  : Range extends [] ? never
  : FindStart<Min, Range> extends infer After extends [...string[]] ?
    FindEnd<Max, After> extends infer Middle extends [...string[]] ?
      Min | AsUnion<Middle> | Max
    : Err<"End not found"> & { range: Range; min: Min; max: Max }
  : Err<"Start not found"> & { range: Range; min: Min; max: Max };

type ErrUnsupported = Err<"unsupported range">;
type ErrDiscontinuous = Err<"discontinuous range">;

export type FindRange<Start extends string, End extends string> =
  Start extends Digit ?
    End extends Digit ?
      _FindRange<Start, End, _Digit>
    : ErrDiscontinuous & { start: Start; end: End }
  : Start extends AsciiLowercase ?
    End extends AsciiLowercase ?
      _FindRange<Start, End, _AsciiLowercase>
    : ErrDiscontinuous & { start: Start; end: End }
  : Start extends AsciiUppercase ?
    End extends AsciiUppercase ?
      _FindRange<Start, End, _AsciiUppercase>
    : ErrDiscontinuous & { start: Start; end: End }
  : ErrUnsupported & { start: Start; end: End };

export type Digit = AsUnion<_Digit>;
export type AsciiLowercase = AsUnion<_AsciiLowercase>;
export type AsciiUppercase = Uppercase<AsciiLowercase>;
export type AsciiLetter = AsciiLowercase | AsciiUppercase;
export type AlNum = AsciiLetter | Digit;
export type Word = AlNum | "_";
export type Whitespace =
  | " "
  | "\t"
  | "\n"
  | "\r"
  | "\f"
  | "\v"
  | "\u0020"
  | "\u00a0"
  | "\u1680"
  | "\u2000"
  | "\u2001"
  | "\u2002"
  | "\u2003"
  | "\u2004"
  | "\u2005"
  | "\u2006"
  | "\u2007"
  | "\u2008"
  | "\u2009"
  | "\u200a"
  | "\u2028"
  | "\u2029"
  | "\u202f"
  | "\u205f"
  | "\u3000"
  | "\ufeff";
