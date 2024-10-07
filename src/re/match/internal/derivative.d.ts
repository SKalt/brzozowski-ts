import { _Match } from ".";
import { Err } from "../../ir";

/** Returns either a _Match or an Err */
export type _Derivative<Str extends string, Prefix extends string> =
  Str extends `${Prefix}${infer Rest}` ?
    Str extends `${infer Matched}${Rest}` ?
      _Match<Matched, Rest>
    : Err<"unreachable: suffix required by construction"> & {
        str: Str;
        suffix: Rest;
      }
  : Err<"string does not match prefix"> & { str: Str; prefix: Prefix };
