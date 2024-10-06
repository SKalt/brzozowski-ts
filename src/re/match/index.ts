import { Eq } from "../../utils";
import {
  Err,
  Group,
  Prefix,
  RE,
  Union as CharUnion,
  GroupKind,
  Alternation,
} from "../ir";
import { Compile } from "../re";

type _MatchUnion<
  Str extends string,
  Match extends string,
  Avoid extends string,
> =
  Eq<Match, never> extends true ? never
  : Eq<Avoid, never> extends true ? never
  : Str extends `${Match}${infer After}` ? Match
  : Avoid;

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

type _ExecCharUnion<U extends CharUnion<any, any>, Str extends string> =
  Str extends "" ? Err<"">
  : Str extends `${infer Next}${infer Rest}` ?
    U extends CharUnion<infer Match, infer Avoid> ?
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
    : never
  : never;
{
  type Actual = _Derivative<"a", never>;
}
{
  type Actual = _ExecCharUnion<CharUnion<"a" | "b", never>, "abc">;
  const _: Actual extends _Match<"a", "bc"> ? true : false = true;
}
{
  type Actual = _ExecCharUnion<CharUnion<never, never>, "abc">;
  const _: Actual extends Err<"empty union"> ? true : false = true;
}
{
  type Actual = _ExecCharUnion<CharUnion<never, "a">, "xbc">;
  const _: Eq<Actual, _Match<"x", "bc">> = true;
}
{
  type Actual = _ExecCharUnion<CharUnion<never, "a">, "bc">;
  const _: Actual extends _Match<"b", "c"> ? true : false = true;
}
{
  type Actual = _ExecCharUnion<CharUnion<"a", "b">, "bc">;
}

type _ExecAlt<Alt extends Alternation<any>, Str extends string> = never; // TODO

/** meta-type: <RE, Str, [..], {..}> => _REmatch */
type Exec<
  R extends RE<any, any>,
  Str extends string,
  Matches extends readonly [...string[]] = [],
  Captures extends readonly [...string[]] = [],
  NamedCaptures extends Record<string, string> = {},
> =
  Matches["length"] extends R["parts"]["length"] ?
    _REMatch<JoinTuple<Matches>, Str, Captures, NamedCaptures>
  : R["parts"][Matches["length"]] extends infer Instruction ?
    Instruction extends Prefix<infer P extends string> ?
      _Derivative<Str, P> extends infer Result ?
        Result extends Err<any> ? [Result, Str]
        : Result extends _Match<infer Matched, infer Rest> ?
          Exec<R, Rest, [...Matches, Matched], Captures, NamedCaptures>
        : Err<"unreachable: _Derivative must return _Match | Err">
      : never
    : Instruction extends CharUnion<any, any> ?
      _ExecCharUnion<Instruction, Str> extends infer Result ?
        Result extends Err<any> ? Result
        : Result extends _Match<infer Matched, infer Rest> ?
          Exec<R, Rest, [...Matches, Matched], Captures, NamedCaptures>
        : Err<"unreachable: _ExecCharUnion must return _Match | Err">
      : never
    : Instruction extends (
      Group<infer Pattern extends RE<any, any>, infer Name, infer Kind>
    ) ?
      Exec<Pattern, Str, [], Captures> extends infer M ?
        Kind extends GroupKind.Capturing ?
          M extends Err<any> ? M
          : M extends (
            _REMatch<
              infer Matched,
              infer Rest,
              infer _Captures,
              infer _NamedCaptures
            >
          ) ?
            Exec<
              R,
              Rest,
              [...Matches, Matched],
              [...Captures, Matched, ..._Captures],
              NamedCaptures &
                _NamedCaptures &
                (Name extends string ? { [K in Name]: Matched } : {})
            >
          : Err<"unsupported group kind"> & { kind: Kind }
        : Err<"unreachable: Exec<_> must return [string[] | Err, string]">
      : Err<"unreachable: unknown instruction"> & {
          instruction: Instruction;
        } & { exe: Exec<Pattern, Str, Matches, Captures, NamedCaptures> }
    : { error: "?" }
  : { error: "???" };

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
      [{ error: "string does not match prefix"; str: "bc"; prefix: "a" }, "bc"]
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

type JoinTuple<T extends readonly [...string[]]> =
  T extends [infer Head extends string, ...infer Tail extends string[]] ?
    `${Head}${JoinTuple<Tail>}`
  : "";

{
  type Actual = JoinTuple<["a", "b", "c"]>;
  const _: Eq<Actual, "abc"> = true;
}
