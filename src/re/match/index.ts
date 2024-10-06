import { BuildTuple, Eq, TupleGTE } from "../../utils";
import {
  Err,
  Group,
  Prefix,
  RE,
  Union as CharUnion,
  GroupKind,
  Alternation,
  CaptureRef,
  Repeat,
  Quantifier,
} from "../ir";
import { Compile } from "../re";

type _Match<Matched extends string, Rest extends string> = {
  matched: Matched;
  rest: Rest;
};

type _REMatch<
  Matched extends string,
  Rest extends string,
  Captures extends readonly [...string[]] = [],
  NamedCaptures extends Record<string, string> = {},
> = _Match<Matched, Rest> & {
  captures: Captures;
  namedCaptures: NamedCaptures;
};

/** meta-type: <string, string> => _Match<_> | err */
type _Derivative<Str extends string, Prefix extends string> =
  Str extends `${Prefix}${infer Rest}` ?
    Str extends `${infer Matched}${Rest}` ?
      _Match<Matched, Rest>
    : Err<"unreachable: suffix required by construction"> & {
        str: Str;
        suffix: Rest;
      }
  : Err<"string does not match prefix"> & { str: Str; prefix: Prefix };
{
  type Actual = _Derivative<"abc", "a">;
  const _: Eq<Actual, _Match<"a", "bc">> = true;
}
{
  type Actual = _Derivative<"abc", "a" | "b">;
  const _: Eq<Actual, _Match<"a", "bc">> = true;
}
type _JoinMatches<
  T extends readonly [...unknown[]],
  Joined extends string = "",
> =
  T extends [] ? Joined
  : T extends [_Match<infer Matched, any>, ...infer Tail] ?
    _JoinMatches<Tail, `${Joined}${Matched}`>
  : Err<"unreachable: _Match required"> & { n: T };

{
  type Actual = _JoinMatches<[_Match<"a", "bc">, _Match<"b", "c">]>;
  const _: Eq<Actual, "ab"> = true;
}
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

type _ExecCharUnion<
  Str extends string,
  Match extends string,
  Avoid extends string,
> =
  Str extends "" ? Err<"">
  : Str extends `${infer Next}${infer Rest}` ?
    [Match, Avoid] extends [never, never] ? Err<"empty union">
    : [_Derivative<Next, Match>, _Derivative<Next, Avoid>] extends (
      [infer M, infer A]
    ) ?
      M extends _Match<any, ""> ? _Match<Next, Rest>
      : A extends Err<any> ? _Match<Next, Rest>
      : Err<"no match"> & {
          char: Next;
          match_chars: Match;
          avoid_chars: Avoid;
        }
    : never
  : never;

{
  type Actual = _ExecCharUnion<"abc", "a" | "b", never>;
  const _: Actual extends _Match<"a", "bc"> ? true : false = true;
}
{
  type Actual = _ExecCharUnion<"abc", never, never>;
  const _: Actual extends Err<"empty union"> ? true : false = true;
}
{
  type Actual = _ExecCharUnion<"xbc", never, "a">;
  const _: Eq<Actual, _Match<"x", "bc">> = true;
}
{
  type Actual = _ExecCharUnion<"bc", never, "a">;
  const _: Actual extends _Match<"b", "c"> ? true : false = true;
}
{
  type Actual = _ExecCharUnion<"bc", "a", "b">;
}

type _ExecAlt<
  Branches extends readonly [...unknown[]],
  Str extends string,
  Captures extends readonly [...string[]],
> =
  Branches extends [] ? Err<"no branches match">
  : Branches extends [infer Head, ...infer Tail] ?
    _Exec<Head, Str, Captures> extends infer Result ?
      Result extends Err<any> ? _ExecAlt<Tail, Str, Captures>
      : Result extends _Match<any, any> ? Result
      : Err<"unreachable: _Exec must return _Match | _REMatch | Err">
    : never
  : never; // unreachable: Branches must be [] | [..]

type _ExecGroup<
  Pattern extends RE<any, any, any>,
  Kind extends GroupKind,
  Captures extends readonly [...string[]],
  // NamedCaptures get joined with the parent's namedCaptures, so passing them down is unnecessary
  Str extends string,
> =
  Kind extends GroupKind.Capturing ?
    Exec<Pattern, Str, [], Captures> extends infer M ?
      M extends Err<any> ? M
      : M extends _REMatch<any, any, any, any> ?
        Kind extends GroupKind.Capturing ?
          M["captures"] extends (
            [...Captures, ...infer SubCaptures extends string[]]
          ) ?
            _REMatch<
              M["matched"],
              M["rest"],
              [...Captures, M["matched"], ...SubCaptures],
              M["namedCaptures"]
            >
          : never
        : M
      : Err<"unreachable: Exec<_> must return _REmatch | Err">
    : never
  : Err<"unsupported group kind"> & { kind: Kind };

/** meta-type: => _REmatch | _Match | Err */ // TODO: | _Match
type _Exec<
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
      : Result extends _REMatch<any, any, any, any> ?
        Kind extends GroupKind.Capturing ?
          _REMatch<
            Result["matched"],
            Result["rest"],
            Result["captures"],
            NamedCaptures &
              Result["namedCaptures"] &
              (Name extends string ? { [K in Name]: Result["matched"] } : {})
          >
        : _REMatch<
            Result["matched"],
            Result["rest"],
            Result["captures"],
            NamedCaptures & Result["namedCaptures"]
          >
      : Err<"unreachable: _ExecGroup must return _REMatch | Err">
    : never
  : Err<"unsupported instruction"> & { instruction: Instruction };

/** meta-type: <RE, Str, [..], {..}> => _REmatch */
type Exec<
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

{
  type MyRegex = Compile<"(a(b(c))(d))">;
  //                    0 --~~~~~~----
  //                          2    3
  type Actual = Exec<MyRegex, "abcd">;
  const _: Eq<Actual, _REMatch<"abcd", "", ["abcd", "bc", "c", "d"]>> = true;
}
{
  type MyRegex = Compile<"a(b)">;
  type Actual = Exec<MyRegex, "ab">;
}
{
  type MyRegex = Compile<"a(b)">;
  type Actual = Exec<MyRegex, "ab">;
  const _: Eq<Actual, _REMatch<"ab", "", ["b"]>> = true;
}
{
  type MyRegex = Compile<"a(?<B>b)c">;
  type Actual = Exec<MyRegex, "abc">;
  const _: Eq<Actual, _REMatch<"abc", "", ["b"], { B: "b" }>> = true;
}

{
  type MyRegex = Compile<"a">;
  {
    type Actual = Exec<MyRegex, "ab">;
    const _: Eq<Actual, _REMatch<"a", "b">> = true;
  }
  {
    type Actual = Exec<MyRegex, "bc">;
    const _: Eq<
      Actual,
      { error: "string does not match prefix"; str: "bc"; prefix: "a" }
    > = true;
  }
}

{
  type MyRegex = Compile<"a|b">;
  {
    type Actual = Exec<MyRegex, "a">;
    const _: Eq<Actual, _REMatch<"a", "", []>> = true;
  }
  {
    type Actual = Exec<MyRegex, "b">;
    const _: Eq<Actual, _REMatch<"b", "", []>> = true;
  }
  {
    type Actual = Exec<MyRegex, "c">;
    const _: Eq<Actual, { error: "no branches match" }> = true;
  }
}
{
  type MyRegex = Compile<"a.c">;
  type Actual = Exec<MyRegex, "abc">;
  const _: Eq<Actual, _REMatch<"abc", "">> = true;
}

{
  type MyRegex = Compile<"a(b)\\1">;
  type Actual = Exec<MyRegex, "abb">;
  const _: Eq<Actual, _REMatch<"abb", "", ["b"]>> = true;
}
{
  type MyRegex = Compile<"a(b)(c)">;
  type _captures = MyRegex["captures"];
  type Match = Exec<MyRegex, "abc">;
  type Captures = Match["captures"];
  const captures: Captures = ["b", "c"];
}

type JoinTuple<T extends readonly [...string[]]> =
  T extends [infer Head extends string, ...infer Tail extends string[]] ?
    `${Head}${JoinTuple<Tail>}`
  : "";

{
  type Actual = JoinTuple<["a", "b", "c"]>;
  const _: Eq<Actual, "abc"> = true;
}

{
  type MyRegex = Compile<"a{2,3}">;
  {
    const ok: Exec<MyRegex, "aaa">["matched"] = "aaa";
  }
  {
    const ok: Exec<MyRegex, "aaaa">["matched"] = "aaa";
  }
  {
    const ok: Exec<MyRegex, "aa">["matched"] = "aa";
  }
  {
    const ok: Exec<MyRegex, "a">["error"] = "string does not match prefix";
  }
}
{
  type MyRegex = Compile<"a+?">;
  {
    const ok: Exec<MyRegex, "aa">["matched"] = "a";
  }
  {
    const ok: Exec<MyRegex, "aaa">["matched"] = "a";
  }
  {
    const ok: Exec<MyRegex, "">["error"] = "string does not match prefix";
  }
}
{
  type MyRegex = Compile<"a*?">;
  {
    const ok: Exec<MyRegex, "aa">["matched"] = "";
  }
  {
    const ok: Exec<MyRegex, "aaa">["matched"] = "";
  }
  {
    const ok: Exec<MyRegex, "">["matched"] = "";
  }
}
{
  type MyRegex = Compile<"a?b">;
  {
    const ok: Exec<MyRegex, "ab">["matched"] = "ab";
  }
  {
    const ok: Exec<MyRegex, "b">["matched"] = "b";
  }
  {
    const ok: Exec<MyRegex, "a">["error"] = "string does not match prefix";
  }
}

{
  type MyRegex = Compile<"A+">;
  type Result = Exec<
    MyRegex,
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
  >;
  const ok: "matched" extends keyof Result ? true : false = true;
}
