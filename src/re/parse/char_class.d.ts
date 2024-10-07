// meta-type: string => [Union, string] | { error: string }
import { AsciiLowercase, AsciiUppercase, Digit } from "../../char";
import { Union as CharUnion, Prefix } from "../ir";
import { _ParseEscape } from "./escape";

/** meta-type: string => CharUnion | { error: string } */
type _ParseCharRange<Start extends string, End extends string> =
  [Start, End] extends ["a", "z"] ? CharUnion<AsciiLowercase>
  : [Start, End] extends ["A", "Z"] ? CharUnion<AsciiUppercase>
  : [Start, End] extends ["0", "9"] ? CharUnion<Digit>
  : { error: "unsupported char range"; start: Start; end: End };

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
      Parse<{ inverse: true; union: CharUnion }, Rest>
    : Parse<{ inverse: false; union: CharUnion }, Str>
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
      : never
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
    : never
  : never;
