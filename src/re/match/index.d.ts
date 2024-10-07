import { JoinTuple } from "../../utils";
import { Err, RE } from "../ir";
import { _Exec, _Match, _REMatch } from "./internal";
import { _ExecAlt } from "./internal/alt";
import { _ExecCharUnion } from "./internal/char_union";
import { _Derivative } from "./internal/derivative";
import { _ExecGroup } from "./internal/group";
import { _ExecRepeat } from "./internal/repeat";

/** meta-type: <RE, Str, [..], {..}> => _REmatch */
export type Exec<
  R extends RE<any, any, any>,
  Str extends string,
  Matches extends readonly [...string[]] = [],
  Captures extends readonly [...string[]] = [],
  NamedCaptures extends Record<string, string> = {},
> =
  Matches["length"] extends R["parts"]["length"] ?
    _REMatch<JoinTuple<Matches>, Str, Captures, NamedCaptures>
  : R["parts"][Matches["length"]] extends infer Instruction ?
    _Exec<Instruction, Str, Captures, NamedCaptures> extends infer Result ?
      Result extends Err<any> ? Result
      : Result extends _REMatch<any, any, any, any> ?
        Exec<
          R,
          Result["rest"],
          [...Matches, Result["matched"]],
          Result["captures"],
          Result["namedCaptures"]
        >
      : Result extends _Match<infer Matched, infer Rest> ?
        Exec<R, Rest, [...Matches, Matched], Captures, NamedCaptures>
      : Err<"unreachable: _Exec must return _Match | _REMatch | Err"> & {
          __result: Result;
        }
    : never
  : never;
