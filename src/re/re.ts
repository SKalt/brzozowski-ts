import { Digit, Word } from "../char";
import { _CheckFinite } from "../internal";
import { Eq } from "../utils";
import type {
  Union as CharUnion,
  Prefix,
  Quantifier,
  Plus,
  Star,
  Optional,
  Repeat,
  Err,
} from "./ir";
import { Parse as _ParseCharClassLiteral } from "./parse/char_class";
import { _ParseEscape } from "./parse/escape";
import { _ParseQuantifier } from "./parse/quantifier";

type Group<
  Pattern extends RE<any, string> = RE<[]>,
  Name extends string | null = null,
  Kind extends GroupKind = GroupKind.Capturing,
> = {
  kind: GroupKind;
  name: Name;
  pattern: Pattern;
};

const enum GroupKind {
  NonCapturing,
  Capturing,
  Lookahead,
  NegativeLookahead,
  Lookbehind,
  NegativeLookbehind,
}
type _GroupMeta<Kind extends GroupKind, Name extends string | null = null> = {
  kind: Kind;
  name: Name;
};
/** meta-type: => [{kind: GroupType, name: string | null}, string] */
type _ParseGroupMeta<Str extends string> =
  Str extends `${infer Next}${infer Rest}` ?
    Next extends "?" ?
      Rest extends `${infer Next}${infer Rest}` ?
        Next extends ":" ? [_GroupMeta<GroupKind.NonCapturing>, Rest]
        : Next extends `=` ? [_GroupMeta<GroupKind.Lookahead>, Rest]
        : Next extends `!` ? [_GroupMeta<GroupKind.NegativeLookahead>, Rest]
        : Next extends `<` ?
          Rest extends `${infer Next}${infer Rest2}` ?
            Next extends "=" ? [_GroupMeta<GroupKind.Lookbehind>, Rest2]
            : Next extends `!` ?
              [_GroupMeta<GroupKind.NegativeLookbehind>, Rest2]
            : Rest extends `${infer Name extends string}>${infer Rest}` ?
              [_GroupMeta<GroupKind.Capturing, Name>, Rest]
            : Err<"unterminated group name">
          : Err<"unterminated group metadata"> & { prefix: "?<" }
        : Err<"unterminated group metadata"> & { prefix: "?" }
      : [_GroupMeta<GroupKind.Capturing>, Str]
    : [_GroupMeta<GroupKind.Capturing>, Str]
  : Err<"unterminated group">;
{
  type Actual = _ParseGroupMeta<"">;
  const _: Eq<Actual, Err<"unterminated group">> = true;
}
{
  type Actual = _ParseGroupMeta<"?:">;
  const _: Eq<Actual, [_GroupMeta<GroupKind.NonCapturing>, ""]> = true;
}
{
  type Actual = _ParseGroupMeta<"?!abc">;
  const _: Eq<Actual, [_GroupMeta<GroupKind.NegativeLookahead>, "abc"]> = true;
}
{
  type Actual = _ParseGroupMeta<"?:abc">;
  const _: Eq<Actual, [_GroupMeta<GroupKind.NonCapturing>, "abc"]> = true;
}
{
  type Actual = _ParseGroupMeta<"abc">;
  const _: Eq<Actual, [_GroupMeta<GroupKind.Capturing>, "abc"]> = true;
}
{
  type Actual = _ParseGroupMeta<"?<abc">;
  const _: Eq<Actual, Err<"unterminated group name">> = true;
}
{
  type Actual = _ParseGroupMeta<"?<abc>">;
  const _: Eq<Actual, [_GroupMeta<GroupKind.Capturing, "abc">, ""]> = true;
}

/** meta-type: => [Group | Err, string] | Err */
type _ParseGroup<
  Str extends string,
  State extends null | Group<any, any> = null,
  Stack extends readonly [...string[]] = ["("],
> =
  Str extends "" ? Err<"unterminated group">
  : State extends null ?
    _ParseGroupMeta<Str> extends infer M ?
      M extends Err<any> ? M
      : M extends (
        [_GroupMeta<infer Kind, infer Name>, infer Rest extends string]
      ) ?
        _ParseGroup<Rest, Group<RE<[]>, Name, Kind>, Stack>
      : never
    : never
  : State extends Group<infer Pattern, infer Name> ?
    Compile<Str, Pattern, Stack> extends infer M ?
      M extends Err<any> ? M
      : M extends [infer S, infer Rest extends string] ?
        S extends RE<any, any> ?
          [Group<S, Name>, Rest]
        : Err<"1">
      : Err<"2"> & { m: M }
    : Err<"3">
  : Err<"4">;

{
  type Actual = _ParseGroup<"a(b))">;
  const _: Eq<
    Actual,
    [Group<RE<[Prefix<"a">, Group<RE<[Prefix<"b">]>>]>>, ""]
  > = true;
}

{
  type Actual = _ParseGroup<"">;
  const _: Eq<Actual, Err<"unterminated group">> = true;
}
{
  type Actual = _ParseGroup<")">;
  const _: Eq<Actual, Err<"empty group">> = true;
}
{
  type Actual = _ParseGroup<"abc)">;
  const _: Eq<Actual, [Group<RE<[Prefix<"abc">]>>, ""]> = true;
}
{
  type Actual = _ParseGroup<"abc)def">;
  const _: Eq<Actual, [Group<RE<[Prefix<"abc">]>>, "def"]> = true;
}
{
  type Actual = _ParseGroup<"a\\)b)">;
  const _: Eq<Actual, [Group<RE<[Prefix<"a)b">]>>, ""]> = true;
}
{
  type Actual = _ParseGroup<"a(b)c)d">;
}

type RE<
  Parts extends readonly [...unknown[]],
  CaptureNames extends string = never,
> = {
  parts: Parts;
  names: CaptureNames;
};

type _ReduceGroup<State extends RE<any, any>, G extends Group<any, any>> =
  State extends RE<infer Parts, infer CaptureNames> ?
    G extends Group<RE<infer _parts, infer _capture_names>, infer Name> ?
      Name extends CaptureNames | _capture_names ?
        {
          error: `duplicate capture name`;
          name: Name;
          names: CaptureNames | _capture_names;
        }
      : Eq<CaptureNames & _capture_names, never> extends false ?
        {
          error: `duplicate capture name collision`;
          duplicate: CaptureNames & _capture_names;
        }
      : Name extends string ?
        RE<[...Parts, G], CaptureNames | _capture_names | Name>
      : RE<[...Parts, G], CaptureNames | _capture_names>
    : { error: "unreachable: G must be a Group<_>" }
  : { error: "unreachable: State must be populated" };

/** meta-type: => RE | Err */
type Reduce<State extends RE<any, any> | Err<any>, Instruction> =
  State extends Err<any> ? State
  : Instruction extends Err<any> ? Instruction
  : State extends RE<infer Parts, infer CaptureNames> ?
    Parts extends [] ?
      Instruction extends Group<any, any> ? _ReduceGroup<RE<[]>, Instruction>
      : Instruction extends Quantifier<any, any> ? { error: "illegal start" }
      : RE<[Instruction]>
    : Instruction extends Prefix<infer P2 extends string> ?
      Parts extends [...infer Prev, Prefix<infer P1 extends string>] ?
        RE<[Prefix<`${P1}${P2}`>, ...Prev], CaptureNames>
      : RE<[...Parts, Instruction], CaptureNames>
    : Instruction extends Group<any, any> ? _ReduceGroup<State, Instruction>
    : Instruction extends Quantifier<any, any> ?
      Parts extends [...infer Prev, infer P] ?
        P extends Repeat<any, any> ?
          { error: "illegal quantifier after quantifier" } // TODO: implement laziness
        : RE<[...Prev, Repeat<P, Instruction>], CaptureNames>
      : never
    : RE<[...Parts, Instruction], CaptureNames>
  : Err<"ne ver">;

/** meta-type: string => RE | { error: string } */
export type Compile<
  Src extends string,
  State extends RE<any, any> | Err<any> = RE<[]>,
  Stack extends readonly [...string[]] = [],
> =
  _CheckFinite<Src> extends { error: infer E } ? { error: E }
  : Src extends "" ?
    State extends RE<[], any> ?
      Stack extends [] ?
        Err<"empty pattern"> & { stack: Stack }
      : Err<"empty group">
    : State
  : Src extends `${infer Next}${infer After}` ?
    Next extends "+" ? Compile<After, Reduce<State, Plus>, Stack>
    : Next extends "*" ? Compile<After, Reduce<State, Star>, Stack>
    : Next extends "?" ? Compile<After, Reduce<State, Optional>, Stack>
    : Next extends "\\" ?
      _ParseEscape<After> extends (
        [infer Instruction, infer Remainder extends string]
      ) ?
        Compile<Remainder, Reduce<State, Instruction>, Stack>
      : { error: "_ParseEscape panicked" }
    : Next extends "[" ?
      _ParseCharClassLiteral<null, After> extends (
        [infer I, infer Rest extends string]
      ) ?
        Compile<Rest, Reduce<State, I>, Stack>
      : { error: "_ParseCharClassLiteral panicked" }
    : Next extends "{" ?
      _ParseQuantifier<null, After> extends (
        [infer I, infer Rest extends string]
      ) ?
        Compile<Rest, Reduce<State, I>, Stack>
      : _ParseQuantifier<null, After> // err
    : Next extends ")" ?
      Stack extends [] ?
        Err<"unmatched closing parenthesis"> & { state: State; stack: Stack }
      : State extends RE<[]> ? Err<"empty group">
      : [State, After] // this closes a group!
    : Next extends "(" ?
      _ParseGroup<After> extends [infer I, infer Rest extends string] ?
        Compile<Rest, Reduce<State, I>, Stack>
      : { error: "_ParseGroup panicked" }
    : Compile<After, Reduce<State, Prefix<Next>>, Stack>
  : Err<"n ever">;

{
  type Actual = Compile<"\\a">;
  const _: Eq<Actual, RE<[Prefix<"a">]>> = true;
}
{
  type Actual = Compile<"\\t">;
  const _: Eq<Actual, RE<[Prefix<"\t">]>> = true;
}
{
  type Actual = Compile<"\\n">;
  const _: Eq<Actual, RE<[Prefix<"\n">]>> = true;
}
{
  type Actual = Compile<"\\r">;
  const _: Eq<Actual, RE<[Prefix<"\r">]>> = true;
}
{
  type Actual = Compile<"\\w">;
  const _: Eq<Actual, RE<[CharUnion<Word>]>> = true;
}
{
  type Actual = Compile<"\\)">;
  const _: Eq<Actual, RE<[Prefix<")">]>> = true;
}
{
  type Actual = Compile<"[0-9]+">;
  const _: Eq<Actual, RE<[Repeat<CharUnion<Digit>, Plus>]>> = true;
}
{
  type Actual = Compile<"[0-9]{3}">;
  const _: Eq<Actual, RE<[Repeat<CharUnion<Digit>, Quantifier<3, 3>>]>> = true;
}
{
  type Actual = Compile<"[0-9]{3,}">;
  const _: Eq<Actual, RE<[Repeat<CharUnion<Digit>, Quantifier<3>>]>> = true;
}
{
  type Actual = Compile<"">;
  const _: Actual extends Err<"empty pattern"> ? true : false = true;
}

{
  type Actual = Compile<"(a)">;
  const _: Eq<Actual, RE<[Group<RE<[Prefix<"a">]>>]>> = true;
}
{
  type Actual = Compile<"\\)">;
  const _: Eq<Actual, RE<[Prefix<")">]>> = true;
}
{
  type Actual = Compile<"(\\))">;
  const _: Eq<Actual, RE<[Group<RE<[Prefix<")">]>>]>> = true;
}
{
  type Actual = Compile<"(a)(b)">;
  const _: Eq<
    Actual,
    RE<[Group<RE<[Prefix<"a">]>>, Group<RE<[Prefix<"b">]>>]>
  > = true;
}
{
  type Actual = Compile<"(?<A>a)">;
  const _: Eq<Actual, RE<[Group<RE<[Prefix<"a">]>, "A">], "A">> = true;
  type _ = CaptureNamesOf<Actual["parts"]>;
}

{
  type Actual = Compile<"(?<A>a(?<B>b))">;
}
type CaptureNamesOf<R extends [...unknown[]], Names extends string = never> =
  R extends [] ? Names
  : R extends [infer Head, ...infer Tail] ?
    Head extends Group<any, infer Name extends string> ?
      CaptureNamesOf<Tail, Name | Names>
    : CaptureNamesOf<Tail, Names>
  : never;

// -----------------------------------------------------------------------------
// parsing
// -----------------------------------------------------------------------------

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
    : {
        error: "unreachable: suffix required by construction";
        str: Str;
        suffix: Rest;
      }
  : { error: "string does not match prefix"; str: Str; prefix: Prefix };
{
  type Actual = _Derivative<"abc", "a">;
  const _: Eq<Actual, { matched: "a"; rest: "bc" }> = true;
}
{
  type Actual = _Derivative<"abc", "a" | "b">;
  const _: Eq<Actual, _Match<"a", "bc">> = true;
}

/** meta-type: <I, Str> => _Match<_> | err */
type _Exec<Instruction, Str extends string> =
  Instruction extends Prefix<infer P extends string> ? _Derivative<Str, P>
  : Instruction extends Group<infer Pattern, infer Name> ?
    Pattern extends RE<any, any> ?
      Exec<Pattern, Str> extends [infer M, infer Rest] ?
        never
      : never
    : never
  : never;

type _ExecGroup<G, Str extends string> = never;

/** meta-type: <RE, Str, [..], {..}> => [Err | [] & {}, rest_of_string] */
type Exec<
  R extends RE<any, any>,
  Str extends string,
  Matches extends readonly [...string[]] = [],
  Captures extends readonly [...string[]] = [],
  NamedCaptures extends Record<string, string> = {},
> =
  Matches["length"] extends R["parts"]["length"] ?
    _REMatch<JoinTuple<Matches>, Str, Captures, {}> // TODO: gather named captures
  : R["parts"][Matches["length"]] extends infer Instruction ?
    Instruction extends Prefix<infer P extends string> ?
      _Derivative<Str, P> extends infer Result ?
        Result extends { error: any } ? [Result, Str]
        : Result extends _Match<infer Matched, infer Rest> ?
          Exec<R, Rest, [...Matches, Matched], Captures, NamedCaptures>
        : Err<"unreachable: _Derivative must return _Match | Err">
      : never
    : Instruction extends CharUnion<infer Match, infer Avoid> ? never
    : Instruction extends (
      Group<infer Pattern extends RE<any, any>, infer Name>
    ) ?
      // TODO: factor into sub-type
      Exec<Pattern, Str> extends [infer M, infer Rest extends string] ?
        M extends { error: any } ? [M, Rest]
        : M extends readonly [...string[]] ?
          Exec<R, Rest, [...Matches, JoinTuple<M>]>
        : [
            {
              error: "unreachable: Exec<_> must return [string[] | Err, string]";
            },
            Str,
          ]
      : { error: "unreachable: unknown instruction"; instruction: Instruction }
    : { error: "?" }
  : { error: "???" };

{
  type MyRegex = Compile<"a(b)">;
  type Actual = Exec<MyRegex, "ab">;
  const _: Eq<Actual, [["a", "b"], ""]> = true;
}
{
  type MyRegex = Compile<"a(?<B>b)c">;
  type Actual = Exec<MyRegex, "abc">;
  const _: Eq<Actual, [["a", "b", "c"] & { B: "b" }, ""]> = true;
}

{
  type MyRegex = Compile<"a">;
  {
    type Actual = Exec<MyRegex, "ab">;
    const _: Eq<Actual, [["a"], "b"]> = true;
  }
  {
    type Actual = Exec<MyRegex, "bc">;
    const _: Eq<
      Actual,
      [{ error: "string does not match prefix"; str: "bc"; prefix: "a" }, "bc"]
    > = true;
  }
}

type JoinTuple<T extends readonly [...string[]]> =
  T extends [infer Head extends string, ...infer Tail extends string[]] ?
    `${Head}${JoinTuple<Tail>}`
  : "";

{
  type Actual = JoinTuple<["a", "b", "c"]>;
  const _: Eq<Actual, "abc"> = true;
}
