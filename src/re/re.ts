import {
  AsciiLowercase,
  AsciiUppercase,
  Digit,
  Whitespace,
  Word,
} from "../char";
import { _CheckFinite } from "../internal";
import { Eq } from "../utils";
import type { Union, Prefix, Quantifier, Plus, Star, Optional } from "./ir";

// meta-type: string => [IR, string] | { error: string }
type _ParseEscape<Str extends string> =
  Str extends `${infer Char}${infer Rest}` ?
    Char extends "d" ? [Union<Digit>, Rest]
    : Char extends "w" ? [Union<Word>, Rest]
    : Char extends "s" ? [Union<Whitespace>, Rest]
    : Char extends "D" ? [Union<never, Digit>, Rest]
    : Char extends "W" ? [Union<never, Word>, Rest]
    : Char extends "S" ? [Union<never, Whitespace>, Rest]
    : Char extends "n" ? [Prefix<"\n">, Rest]
    : Char extends "t" ? [Prefix<"\t">, Rest]
    : Char extends "r" ? [Prefix<"\r">, Rest]
    : Char extends "f" ? [Prefix<"\f">, Rest]
    : Char extends "v" ? [Prefix<"\v">, Rest]
    : Char extends "0" ? [Prefix<"\0">, Rest]
    : [Prefix<Char>, Rest]
  : [{ error: `empty escape sequence: ${Str}` }, Str];

// // meta-type: string => [Union, string] | { error: string }
type _ParseCharRange<Start extends string, End extends string> =
  [Start, End] extends ["a", "z"] ? Union<AsciiLowercase>
  : [Start, End] extends ["A", "Z"] ? Union<AsciiUppercase>
  : [Start, End] extends ["0", "9"] ? Union<Digit>
  : { error: `unsupported char range: ${Start}-${End}` };

// meta-type: string => [Union, string] | { error: string }
type _ParseCharClassLiteral<
  State extends
    | null // initial state
    | {
        inverse: true | false;
        union: Union<string, string>;
      },
  Str extends string,
> =
  Str extends "" ? [{ error: "unterminated char class" }, Str]
  : State extends null ?
    Str extends `]${infer _}` ? { error: `empty char class: ${Str}` }
    : Str extends `^${infer Rest extends string}` ?
      _ParseCharClassLiteral<{ inverse: true; union: Union }, Rest>
    : _ParseCharClassLiteral<{ inverse: false; union: Union }, Str>
  : State extends (
    {
      inverse: infer I extends boolean;
      union: Union<infer Match, infer Avoid>;
    }
  ) ?
    Str extends `]${infer Rest}` ?
      I extends true ?
        [Union<Avoid, Match>, Rest]
      : [Union<Match, Avoid>, Rest]
    : Str extends `\\${infer Rest}` ?
      _ParseEscape<Rest> extends (
        [infer Instruction, infer Remainder extends string]
      ) ?
        Instruction extends Prefix<infer Prefix extends string> ?
          _ParseCharClassLiteral<
            { inverse: I; union: Union<Match | Prefix, Avoid> },
            Remainder
          >
        : Instruction extends Union<infer Match2, infer Avoid2> ?
          _ParseCharClassLiteral<
            {
              inverse: I;
              union: Union<Match | Match2, Avoid | Avoid2>;
            },
            Remainder
          >
        : [I, Remainder] // I must be error
      : never
    : Str extends `${infer Next extends string}${infer Rest}` ?
      Rest extends `-${infer End extends string}${infer Remainder}` ?
        End extends "]" ?
          _ParseCharClassLiteral<
            { inverse: I; union: Union<Match | Next | "-", Avoid> },
            Rest
          >
        : _ParseCharRange<Next, End> extends Union<infer Match2, infer Avoid2> ?
          _ParseCharClassLiteral<
            {
              inverse: I;
              union: Union<Match | Match2, Avoid | Avoid2>;
            },
            Remainder
          >
        : _ParseCharRange<Next, End> // err
      : _ParseCharClassLiteral<
          { inverse: I; union: Union<Match | Next, Avoid> },
          Rest
        >
    : never
  : never;
{
  type Actual = _ParseCharClassLiteral<null, "a-z]">;
  const _: Eq<Actual, [Union<AsciiLowercase>, ""]> = true;
}
{
  type Actual = _ParseCharClassLiteral<null, "a-z0-9]">;
  const _: Eq<Actual, [Union<AsciiLowercase | Digit>, ""]> = true;
}
{
  type Actual = _ParseCharClassLiteral<null, "0-9A]">;
  const _: Eq<Actual, [Union<Digit | "A">, ""]> = true;
}
{
  type Actual = _ParseCharClassLiteral<null, "0-]">;
  const _: Eq<Actual, [Union<"0" | "-">, ""]> = true;
}
{
  type Actual = _ParseCharClassLiteral<null, "0-">;
  const _: Eq<Actual, [{ error: "unterminated char class" }, ""]> = true;
}

type Group<
  Pattern extends RE<any, any, any> | null,
  Name extends string | null = null,
> = {
  name: Name;
  pattern: Pattern;
};

// meta-type: <string, Group | null> => [Group | Err, string]
type _ParseGroup<Str extends string, State = null> =
  Str extends "" ? [{ error: "unterminated group" }, Str]
  : State extends null ?
    Str extends `)${infer Rest}` ? [{ error: "empty group" }, Rest]
    : Str extends `?=${infer Rest}` ?
      [{ error: "lookahead is not supported" }, Rest]
    : Str extends `?!${infer Rest}` ?
      [{ error: "negative lookahead is not supported" }, Rest]
    : Str extends `?<=${infer Rest}` ?
      [{ error: "lookbehind is not supported" }, Rest]
    : Str extends `?<!${infer Rest}` ?
      [{ error: "negative lookbehind is not supported" }, Rest]
    : Str extends `?<${infer Name extends string}>${infer Rest}` ?
      _ParseGroup<Rest, Group<null, Name>> // TODO: validate name
    : _ParseGroup<Str, Group<null>>
  : State extends Group<infer Pattern, infer Name> ?
    Str extends `${infer inner}\\)${infer Rest}` ?
      Compile<`${inner}\\)`, Pattern> extends infer R ?
        R extends { error: any } ? [R, Rest]
        : R extends RE<any, any, any> ? _ParseGroup<Rest, Group<R, Name>>
        : [{ error: `unreachable: Compile => RE | Err` }, Rest]
      : never
    : Str extends `${infer inner})${infer Rest}` ?
      Compile<inner, Pattern> extends infer R ?
        R extends { error: any } ? [R, Rest]
        : R extends RE<any, any, any> ? [Group<R, Name>, Rest]
        : [{ error: `unreachable: Compile => RE | Err` }, Rest]
      : never
    : [{ error: "unreachable: state should always be Group<_> | null" }, Str]
  : [{ error: "unreachable: 2" }, State];

{
  type Actual = _ParseGroup<"">;
  const _: Eq<Actual, [{ error: "unterminated group" }, ""]> = true;
}
{
  type Actual = _ParseGroup<")">;
  const _: Eq<Actual, [{ error: "empty group" }, ""]> = true;
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

// meta-type: string => [Quantifier, string] | { error: string }
type _ParseQuantifier<
  State extends
    | null // initial state
    | [number], // min recognized
  Str extends string,
> =
  // note: the state is necessary to validate that both min and max are
  // present, numeric, positive, and finite
  Str extends "" ? { error: "unterminated quantifier" }
  : Str extends `-${string}` ? { error: "negative quantifier" }
  : Str extends `Infinity${string}` ? { error: "infinite quantifier" }
  : State extends null ?
    Str extends `}${string}` ? { error: "empty quantifier" }
    : Str extends `${infer Min extends number}}${infer Rest}` ?
      [Quantifier<Min, Min>, Rest]
    : Str extends `${infer Min extends number},}${infer Rest}` ?
      [Quantifier<Min>, Rest]
    : Str extends `${infer Min extends number},${infer Rest}` ?
      _ParseQuantifier<[Min], Rest>
    : { error: `invalid quantifier: {${Str}` }
  : State extends [infer Min extends number] ?
    Str extends `}${infer Rest}` ? [Quantifier<Min, Min>, Rest]
    : Str extends `${infer Max extends number}}${infer Rest}` ?
      [Quantifier<Min, Max>, Rest]
    : { error: `invalid quantifier: {${Min},${Str}` }
  : never;

{
  type Actual = _ParseQuantifier<null, "3}">;
  const _: Eq<Actual, [Quantifier<3, 3>, ""]> = true;
}
{
  type Actual = _ParseQuantifier<null, "3,}">;
  const _: Eq<Actual, [Quantifier<3>, ""]> = true;
}
{
  type Actual = _ParseQuantifier<null, "3,4}">;
  const _: Eq<Actual, [Quantifier<3, 4>, ""]> = true;
}
{
  type Actual = _ParseQuantifier<null, "Infinity}">;
  const _: Eq<Actual, { error: "infinite quantifier" }> = true;
}
{
  type Actual = _ParseQuantifier<null, "-3}">;
  const _: Eq<Actual, { error: "negative quantifier" }> = true;
}
{
  type Actual = _ParseQuantifier<null, "}">;
  const _: Eq<Actual, { error: "empty quantifier" }> = true;
}
{
  type Actual = _ParseQuantifier<[1], "}">;
  const _: Eq<Actual, [Quantifier<1, 1>, ""]> = true;
}
{
  type Actual = _ParseQuantifier<[1], "3}">;
  const _: Eq<Actual, [Quantifier<1, 3>, ""]> = true;
}

type _Parse<Src extends string> = // peek at the next character
  Src extends `${infer Next}${infer After}` ?
    Next extends "\\" ? _ParseEscape<After>
    : Next extends "[" ? _ParseCharClassLiteral<null, After>
    : Next extends "(" ? _ParseGroup<After>
    : Next extends "{" ? _ParseQuantifier<null, After>
    : Next extends "|" ? never /* TODO */
    : Next extends "*" ? Star
    : Next extends "+" ? Plus
    : Next extends "?" ? Optional
    : [Prefix<Next>, After]
  : never;

type RE<
  Parts extends readonly [...unknown[]],
  Captures extends readonly [...number[]] = [],
  NamedCaptures extends Record<string, number> = {},
> = {
  parts: Parts;
  /** indexes into .parts */
  captures: Captures;
  namedCaptures: NamedCaptures;
};
type _ReduceGroup<State, G extends Group<any, any>> =
  State extends RE<infer Parts, infer Captures, infer NamedCaptures> ?
    G extends (
      Group<
        RE<infer _parts, infer _captures, infer _named_captures>,
        infer Name
      >
    ) ?
      Name extends keyof NamedCaptures ?
        { error: `duplicate capture name: ${Name}` }
      : Eq<keyof NamedCaptures & keyof _named_captures, never> extends false ?
        {
          error: `duplicate capture name collision`;
          duplicate: keyof NamedCaptures & keyof _named_captures;
        }
      : Name extends string ?
        RE<
          [...Parts, G],
          [...Captures, Parts["length"]],
          NamedCaptures & { [K in Name]: Parts["length"] }
        >
      : RE<[...Parts, G], [...Captures, Parts["length"]], NamedCaptures>
    : { error: "!" }
  : { error: "~" };

type Reduce<State, Instruction> =
  Instruction extends { error: any } ? Instruction
  : State extends null ?
    Instruction extends Group<any, any> ?
      _ReduceGroup<RE<[]>, Instruction>
    : RE<[Instruction]>
  : State extends RE<infer Parts, infer Captures, infer NamedCaptures> ?
    Parts extends [] ? RE<[Instruction], Captures, NamedCaptures>
    : Instruction extends Prefix<infer P2 extends string> ?
      Parts extends [...infer Prev, Prefix<infer P1 extends string>] ?
        RE<[Prefix<`${P1}${P2}`>, ...Prev], Captures, NamedCaptures>
      : RE<[...Parts, Instruction], Captures, NamedCaptures>
    : Instruction extends Group<any, any> ? _ReduceGroup<State, Instruction>
    : RE<[...Parts, Instruction], Captures, NamedCaptures>
  : never;

/** meta-type: string => RE | { error: string } */
export type Compile<Src extends string, State = null> =
  _CheckFinite<Src> extends { error: infer E } ? { error: E }
  : Src extends "" ?
    State extends null ?
      { error: "empty pattern" }
    : State
  : Src extends `${infer Next}${infer After}` ?
    Next extends "+" ? Compile<After, Reduce<State, Plus>>
    : Next extends "*" ? Compile<After, Reduce<State, Star>>
    : Next extends "?" ? Compile<After, Reduce<State, Optional>>
    : Next extends "\\" ?
      _ParseEscape<After> extends (
        [infer Instruction, infer Remainder extends string]
      ) ?
        Compile<Remainder, Reduce<State, Instruction>>
      : { error: "_ParseEscape panicked" }
    : Next extends "[" ?
      _ParseCharClassLiteral<null, After> extends (
        [infer I, infer Rest extends string]
      ) ?
        Compile<Rest, Reduce<State, I>>
      : { error: "_ParseCharClassLiteral panicked" }
    : Next extends "{" ?
      _ParseQuantifier<null, After> extends (
        [infer I, infer Rest extends string]
      ) ?
        Compile<Rest, Reduce<State, I>>
      : _ParseQuantifier<null, After> // err
    : Next extends "(" ?
      _ParseGroup<After> extends [infer I, infer Rest extends string] ?
        Compile<Rest, Reduce<State, I>>
      : { error: "_ParseGroup panicked" }
    : Compile<After, Reduce<State, Prefix<Next>>>
  : never;

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
  const _: Eq<Actual, RE<[Union<Word>]>> = true;
}
{
  type Actual = Compile<"\\)">;
  const _: Eq<Actual, RE<[Prefix<")">]>> = true;
}
{
  type Actual = Compile<"[0-9]+">;
  const _: Eq<Actual, RE<[Union<Digit>, Plus]>> = true;
}
{
  type Actual = Compile<"[0-9]{3}">;
  const _: Eq<Actual, RE<[Union<Digit>, Quantifier<3, 3>]>> = true;
}
{
  type Actual = Compile<"[0-9]{3,}">;
  const _: Eq<Actual, RE<[Union<Digit>, Quantifier<3, number>]>> = true;
}
{
  type Actual = Compile<"">;
  const _: Eq<Actual, { error: "empty pattern" }> = true;
}

{
  type Actual = Compile<"(a)">;
  const _: Eq<Actual, RE<[Group<RE<[Prefix<"a">]>>], [0]>> = true;
}
{
  type Actual = Compile<"\\)">;
  const _: Eq<Actual, RE<[Prefix<")">]>> = true;
}
{
  type Actual = Compile<"(\\))">;
  const _: Eq<Actual, RE<[Group<RE<[Prefix<")">]>>], [0]>> = true;
}
{
  type Actual = Compile<"(a)(b)">;
  const _: Eq<
    Actual,
    RE<[Group<RE<[Prefix<"a">]>>, Group<RE<[Prefix<"b">]>>], [0, 1]>
  > = true;
}
{
  type Actual = Compile<"(?<A>a)">;
  const _: Eq<
    Actual,
    {
      parts: [Group<RE<[Prefix<"a">], [], {}>, "A">];
      captures: [0];
      namedCaptures: {
        A: 0;
      };
    }
  > = true;
  type _ = CaptureNames<Actual>;
}
type CaptureNames<R extends RE<any, any, any>> =
  R extends RE<any, any, infer NamedCaptures extends Record<string, any>> ?
    keyof NamedCaptures
  : never;

// -----------------------------------------------------------------------------
// parsing
// -----------------------------------------------------------------------------
