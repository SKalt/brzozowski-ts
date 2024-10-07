import { _Match, _REMatch, _Exec } from ".";
import { BuildTuple, TupleGTE } from "../../../utils";
import { Err, Quantifier } from "../../ir";

type _JoinMatches<
  T extends readonly [...unknown[]],
  Joined extends string = "",
> =
  T extends [] ? Joined
  : T extends [_Match<infer Matched, any>, ...infer Tail] ?
    _JoinMatches<Tail, `${Joined}${Matched}`>
  : Err<"unreachable: _Match required"> & { n: T };

/** => _REmatch */
type _RepeatDone<
  Str extends string,
  N extends
    | readonly [..._Match<any, any>[]]
    | readonly [..._REMatch<any, any, any, any>[]],
> =
  N extends [] ? _REMatch<"", Str>
  : _JoinMatches<N> extends infer Matched extends string ?
    Str extends `${Matched}${infer Rest}` ?
      N extends [_REMatch<any, any, any, any>, ...infer _] ?
        _REMatch<Matched, Rest, N[0]["captures"], N[0]["namedCaptures"]>
      : _Match<Matched, Rest>
    : Err<"unreachable: string does not match prefix"> & {
        _matched: Matched;
        str: Str;
      }
  : Err<"unreachable: _JoinMatches must return string">;

type _ExecRepeat<
  I,
  Q extends Quantifier<any, any>,
  Str extends string,
  Captures extends readonly [...string[]],
  Matched extends string = "",
  N extends
    | readonly [..._Match<any, any>[]]
    | [..._REMatch<any, any, any, any>[]] = [],
> =
  N["length"] extends Q["max"] ? _RepeatDone<Str, N>
  : Str extends `${Matched}${infer Rest}` ?
    _Exec<I, Rest, Captures> extends infer M ?
      M extends Err<any> ?
        TupleGTE<N, BuildTuple<Q["min"]>> extends true ?
          _RepeatDone<Str, N>
        : M & { _n: N } // fail
      : M extends _Match<any, any> ?
        M["matched"] extends "" ?
          _RepeatDone<Str, N> // TODO: ?
        : _ExecRepeat<
            I,
            Q,
            Str,
            Captures,
            `${Matched}${M["matched"]}`,
            [...N, M]
          >
      : Err<"unreachable"> & { m: M }
    : never
  : Err<"unreachable"> & { cause: "infallible" };
