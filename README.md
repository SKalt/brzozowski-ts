# `brzozowski-ts`

An experiment in implementing static checks of regular expressions in Typescript using [Brzozowski derivatives][wiki].

This is also an experiment in what an API for what a RegEx-validated string type might look like.
There has already been discussion of the use cases and potential API in the [Typescript RegEx-validated string types issue][ts-issue].

# Use case

This allows you to make assertions about string constants:

```ts
import type { Compile, Exec, Recognize } from "brzozowski-ts/src";

type HexStrRE = Compile<"(?<hex>[0-9A-Fa-f]{5,})">;
type Match = Exec<HexStrRE, "abc123">;
const captures: Match["captures"] = ["abc123"];
const groups: Match["groups"] = { hex: "abc123" };

type HexStr<S extends string> = Recognize<HexStrRE, S>;
type NominalHex = string & { readonly isHex: unique symbol };

const castSpell = <S extends string>(hex: HexStr<S> | NominalHex) => hex;

const spell = castSpell("00dead00" as const); // ok!
const spellCheck: typeof spell = "00dead00"; // ok!

// @ts-expect-error
castSpell("xyz");

let dynamicHex: string = "a5df0";
castSpell(dynamicHex as NominalHex); // ok!
```

<!-- TODO: note on integration with nominal typing -->

## Limitations

- `RecognizePattern<RE, Str>` uses a limited and naively-implemented regular expression language:
  - no lookaround:
    - no positive or negative lookahead: `(?=no)` `(?!nope)`
    - no positive or negative lookbehind: `(?<=no)` `(?<!nope)`
  - matches always start from the start of the string: `/^always/`
  - string recognition is implemented as a series of potentially-nested commands rather than state transitions within a finite automaton.
  - no flags:
    - no case-insensitive matching: `/NOPE/i`
    - no multiline mode: `nope$`
- Using these types likely slows down builds
<!-- TODO: quantify the cost of compile-time RegExp matching -->

# Usage

This is pre-alpha software: the API will change without warning, the implementation is brittle and incomplete, and none of this code has been optimized for memory usage or speed.

If you're brave, you can:

```sh
pnpm add -D "git+https://github.com/skalt/brzozowski-ts.git"
```

and import the types like

```ts
import type { Compile, Exec } from "brzozowski-ts/src";
```

# Design

Compile-time parsing follows this general algorithm:

0. Given a constant string type `S` and a regular expression string type `R`
1. take the derivative of `R` with respect the start of `S` to produce a shorter regular expression `r` and a shorter string `s`
2. recur using `s` and `r`
3. when `r` is empty, the entire regular expression has been matched.
4. if `s` is empty and `r` is not, the expression has not been matched

## Prior art

- [These DFA-based pure-type RegEx implementations](https://github.com/microsoft/TypeScript/issues/6579#issuecomment-710776922) were an inspiration! `brzozowski_ts` adds the ability to compile regular expressions, but uses a naive backtracking algorithm based on Brzozowski derivatives rather than <abbr title="Deterministic Finite Automaton">DFA</abbr>s.

<!-- links -->

[wiki]: https://en.wikipedia.org/wiki/Brzozowski_derivative
[ts-issue]: https://github.com/microsoft/TypeScript/issues/41160#issuecomment-1503653578
