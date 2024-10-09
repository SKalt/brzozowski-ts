import {
  Prefix,
  Union as CharUnion,
  Alternation,
  CaptureRef,
  Repeat,
  Group,
  Err,
} from "../../ir";
import { _ExecAlt } from "./alt";
import { _ExecCharUnion } from "./char_union";
import { _Derivative } from "./derivative";
import { _ExecGroup } from "./group";
import { _ExecRepeat } from "./repeat";

export type _Match<Matched extends string, Rest extends string> = {
  matched: Matched;
  rest: Rest;
};

export type REMatch<
  Matched extends string,
  Rest extends string,
  Captures extends readonly [...string[]] = [],
  NamedCaptures extends Record<string, string> = {},
> = _Match<Matched, Rest> & {
  captures: Captures;
  namedCaptures: NamedCaptures;
};

/** meta-type: => _REmatch | _Match | Err */
export type _Exec<
  Instruction,
  Str extends string,
  Captures extends readonly [...string[]] = [],
  NamedCaptures extends Record<string, string> = {},
> =
  Instruction extends Prefix<infer P> ? _Derivative<Str, P>
  : Instruction extends CharUnion<infer MatchChars, infer AvoidChars> ?
    _ExecCharUnion<Str, MatchChars, AvoidChars>
  : Instruction extends Alternation<infer Branches> ?
    _ExecAlt<Branches, Str, Captures>
  : Instruction extends CaptureRef<infer Index> ?
    _Derivative<Str, ["", ...Captures][Index]> // <- "" is a placeholder for the 0th capture, which can't be referenced
  : Instruction extends Repeat<infer I, infer Q> ?
    _ExecRepeat<I, Q, Str, Captures, "", []>
  : Instruction extends Group<infer Pattern, infer Name, infer Kind> ?
    _ExecGroup<Pattern, Kind, Captures, Str> extends infer Result ?
      Result extends Err<any> ? Result
      : Result extends REMatch<any, any, any, any> ?
        REMatch<
          Result["matched"],
          Result["rest"],
          Result["captures"],
          NamedCaptures &
            Result["namedCaptures"] &
            (Name extends "" ? {} : { [K in Name]: Result["matched"] })
        >
      : Err<"unreachable: _ExecGroup must return _REMatch | Err">
    : Err<"unreachable: infallible infer">
  : Err<"unsupported instruction"> & { instruction: Instruction };
