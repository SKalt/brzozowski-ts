import { _Match } from ".";
import { _CheckFinite, Eq } from "../../../utils";
import { Err } from "../../ir";
import { _Derivative } from "./derivative";

export type _ExecCharUnion<
  Str extends string,
  Match extends string,
  Avoid extends string,
> =
  _CheckFinite<Str> extends Err<infer E> ? Err<E>
  : Str extends "" ? Err<"character class cannot match the empty string">
  : Str extends `${infer Next}${infer Rest}` ?
    [Match, Avoid] extends [never, never] ? Err<"empty union">
    : [_Derivative<Next, Match>, _Derivative<Next, Avoid>] extends (
      [infer M, infer A]
    ) ?
      M extends _Match<any, ""> ? _Match<Next, Rest>
      : Eq<Avoid, never> extends true ? M
      : A extends Err<any> ? _Match<Next, Rest>
      : Err<"no match"> & {
          char: Next;
          match_chars: Match;
          avoid_chars: Avoid;
        }
    : Err<"unreachable: infallible infer">
  : Err<"unreachable: Str must either be empty or have at least 1 character">;
