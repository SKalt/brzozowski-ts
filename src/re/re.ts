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
  GroupKind,
  RE,
  Group,
  Alternation,
  DotAll,
} from "./ir";
import { Parse as _ParseCharClassLiteral } from "./parse/char_class";
import { _ParseEscape } from "./parse/escape";
import { _ParseQuantifier } from "./parse/quantifier";

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
  State extends null | Group<any, any, any> = null,
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
    : Err<"unreachable: G must be a Group<_>">
  : Err<"unreachable: State must be populated">;

/** meta-type: => RE | Err */
type Reduce<State extends RE<any, any> | Err<any>, Instruction> =
  State extends Err<any> ? State
  : Instruction extends Err<any> ? Instruction
  : State extends RE<infer Parts, infer CaptureNames> ?
    Parts extends [] ?
      Instruction extends Group<any, any> ? _ReduceGroup<RE<[]>, Instruction>
      : Instruction extends Quantifier<any, any> ?
        Err<"illegal quantifier at start">
      : Instruction extends "|" ? Err<"illegal alternation at start">
      : RE<[Instruction]>
    : Parts extends [...infer Old, infer PrevInstruction] ?
      PrevInstruction extends Alternation<infer Branches> ?
        Instruction extends "|" ?
          Err<"empty alternation branch">
        : RE<[...Old, Alternation<[...Branches, Instruction]>], CaptureNames>
      : Instruction extends Prefix<infer P2 extends string> ?
        PrevInstruction extends Prefix<infer P1> ?
          RE<[...Old, Prefix<`${P1}${P2}`>], CaptureNames>
        : RE<[...Parts, Instruction], CaptureNames>
      : Instruction extends Group<any, any> ? _ReduceGroup<State, Instruction>
      : Instruction extends Quantifier<any, any> ?
        Parts extends [...infer Prev, infer P] ?
          P extends Repeat<any, any> ?
            { error: "illegal quantifier after quantifier" } // TODO: implement laziness
          : RE<[...Prev, Repeat<P, Instruction>], CaptureNames>
        : never
      : Instruction extends "|" ?
        RE<[...Old, Alternation<[PrevInstruction]>], CaptureNames>
      : RE<[...Parts, Instruction], CaptureNames>
    : never
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
    : Next extends "|" ? Compile<After, Reduce<State, "|">, Stack>
    : Next extends "." ? Compile<After, Reduce<State, DotAll>, Stack>
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
  type Actual = Compile<"a.c">;
  const _: Eq<Actual, RE<[Prefix<"a">, DotAll, Prefix<"c">]>> = true;
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
