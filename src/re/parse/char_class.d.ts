// meta-type: string => [Union, string] | { error: string }
import { AsciiLowercase, AsciiUppercase, Digit, FindRange } from "../../char";
import { Union as CharUnion, Err, Prefix } from "../ir";
import { _ParseEscape } from "./escape";

/** meta-type: string => CharUnion | { error: string } */
type _ParseCharRange<Start extends string, End extends string> =
  [Start, End] extends ["a", "z"] ? CharUnion<AsciiLowercase, never>
  : [Start, End] extends ["A", "Z"] ? CharUnion<AsciiUppercase, never>
  : [Start, End] extends ["0", "9"] ? CharUnion<Digit, never>
  : FindRange<Start, End> extends infer Range ?
    Range extends Err<any> ? Range
    : Range extends string ? CharUnion<Range, never>
    : Err<"unreachable: FindRange must return string | Err">
  : Err<"unreachable: infallible infer">;

type _State<Inverse extends boolean, U extends CharUnion<any, any>> = {
  inverse: Inverse;
  union: U;
};

export type Parse<
  State extends
    | null // initial state
    | _State<any, any>,
  Str extends string,
> =
  Str extends "" ? { error: "unterminated char class" }
  : State extends null ?
    Str extends `]${infer _}` ? { error: "empty char class: []" }
    : Str extends `^${infer Rest extends string}` ?
      Parse<{ inverse: true; union: CharUnion<never, never> }, Rest>
    : Parse<{ inverse: false; union: CharUnion<never, never> }, Str>
  : State extends _State<infer I, CharUnion<infer Match, infer Avoid>> ?
    Str extends `]${infer Rest}` ?
      I extends true ?
        [CharUnion<Avoid, Match>, Rest]
      : [CharUnion<Match, Avoid>, Rest]
    : Str extends `\\${infer Rest}` ?
      _ParseEscape<Rest> extends (
        [infer Instruction, infer Remainder extends string]
      ) ?
        Instruction extends Prefix<infer Prefix extends string> ?
          Parse<_State<I, CharUnion<Match | Prefix, Avoid>>, Remainder>
        : Instruction extends CharUnion<infer Match2, infer Avoid2> ?
          Parse<_State<I, CharUnion<Match | Match2, Avoid | Avoid2>>, Remainder>
        : [I, Remainder] // I must be error
      : Err<"unreachable: _ParseEscape must return [any, string]">
    : Str extends `${infer Next extends string}${infer Rest}` ?
      Rest extends `-${infer End extends string}${infer Remainder}` ?
        End extends "]" ?
          Parse<_State<I, CharUnion<Match | Next | "-", Avoid>>, Rest>
        : _ParseCharRange<Next, End> extends (
          CharUnion<infer Match2, infer Avoid2>
        ) ?
          Parse<_State<I, CharUnion<Match | Match2, Avoid | Avoid2>>, Remainder>
        : _ParseCharRange<Next, End> // err
      : Parse<{ inverse: I; union: CharUnion<Match | Next, Avoid> }, Rest>
    : Err<"unreachable: Str must be empty or have at least 1 character">
  : Err<"unreachable: State must be null | _State">;
