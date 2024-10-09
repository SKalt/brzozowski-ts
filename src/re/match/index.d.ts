import { JoinTuple } from "../../utils";
import { Err, RE } from "../ir";
import { _Exec, _Match, REMatch } from "./internal";

/** meta-type: <RE, Str, [..], {..}> => REmatch */
export type Exec<
  R extends RE<any, any, any>,
  Str extends string,
  Matches extends readonly [...string[]] = [],
  Captures extends readonly [...string[]] = [],
  NamedCaptures extends Record<string, string> = {},
> =
  Matches["length"] extends R["parts"]["length"] ?
    REMatch<JoinTuple<Matches>, Str, Captures, NamedCaptures>
  : R["parts"][Matches["length"]] extends infer Instruction ?
    _Exec<Instruction, Str, Captures, NamedCaptures> extends infer Result ?
      Result extends Err<any> ? Result
      : Result extends REMatch<any, any, any, any> ?
        Exec<
          R,
          Result["rest"],
          [...Matches, Result["matched"]],
          Result["captures"],
          Result["groups"]
        >
      : Result extends _Match<infer Matched, infer Rest> ?
        Exec<R, Rest, [...Matches, Matched], Captures, NamedCaptures>
      : Err<"unreachable: _Exec must return _Match | _REMatch | Err"> & {
          __result: Result;
        }
    : Err<"unreachable: infallible infer">
  : Err<"unreachable: Matches['length'] must be less than or equal to R['parts']">;

export type { REMatch } from "./internal";
