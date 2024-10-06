import { Eq } from "../../utils";
import {
  Err,
  Group,
  Prefix,
  RE,
  Union as CharUnion,
  GroupKind,
  Alternation,
  CaptureRef,
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

type __ExecCharUnion<
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
  type Actual = __ExecCharUnion<"abc", "a" | "b", never>;
  const _: Actual extends _Match<"a", "bc"> ? true : false = true;
}
{
  type Actual = __ExecCharUnion<"abc", never, never>;
  const _: Actual extends Err<"empty union"> ? true : false = true;
}
{
  type Actual = __ExecCharUnion<"xbc", never, "a">;
  const _: Eq<Actual, _Match<"x", "bc">> = true;
}
{
  type Actual = __ExecCharUnion<"bc", never, "a">;
  const _: Actual extends _Match<"b", "c"> ? true : false = true;
}
{
  type Actual = __ExecCharUnion<"bc", "a", "b">;
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
  // FIXME: NamedCaptures
  Str extends string,
> =
  Kind extends GroupKind.Capturing ?
    Exec<Pattern, Str, [], Captures> extends infer M ?
      M extends Err<any> ? M
      : M extends _REMatch<any, any, any, any> ? M
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
    __ExecCharUnion<Str, MatchChars, AvoidChars>
  : Instruction extends Group<infer Pattern, infer Name, infer Kind> ?
    _ExecGroup<Pattern, Kind, Captures, Str> extends infer Result ?
      Result extends Err<any> ? Result
      : Result extends _REMatch<any, any, any, any> ?
        Kind extends GroupKind.Capturing ?
          _REMatch<
            Result["matched"],
            Result["rest"],
            [...Result["captures"], Result["matched"]], // FIXME: handle nested captures
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
  : Instruction extends Alternation<infer Branches> ?
    _ExecAlt<Branches, Str, Captures>
  : Instruction extends CaptureRef<infer Index> ?
    _Derivative<Str, ["", ...Captures][Index]> // <- "" is a placeholder for the 0th capture, which can't be referenced
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
      : Err<"unreachable: _Exec must return _Match | _REMatch | Err">
    : never
  : never;

{
  type MyRegex = Compile<"(a(b))">;
  type Actual = Exec<MyRegex, "abc">;
  const _: Eq<Actual, _REMatch<"ab", "c", ["ab", "b"]>> = true;
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
