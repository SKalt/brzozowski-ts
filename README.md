# `brzozowski-ts`

An experiment in implementing static checks of regular expressions in Typescript using [Brzozowski derivatives][wiki].

This is also an experiment in what an API for what a RegEx-validated string type might look like.
There has already been discussion of the use cases and potential API in the [Typescript RegEx-validated string types issue][ts-issue].

# Use case

This allows you to make assertions about constants:

```ts
type HexStrRE = Compile<"(?<hex>[0-9A-Fa-f]{5,})">;
type Match = Exec<HexStrRE, "abc123">;
const captures: Match["captures"] = ["abc123"];
const groups: Match["groups"] = { hex: "abc123" };

type HexStr<S extends string> = Recognize<HexStrRE, S>;

const mustBeHex = <S extends string>(hexStr: HexStr<S>) => hexStr;
// OK! the return type is "abc123"
const ok = mustBeHex("abc123");
// @ts-expect-error
mustBeHex("xyz q");
```

<!-- TODO: note on integration with nominal typing -->

## Limitations

- `RecognizePattern<RE, Str>` uses a limited and naively-implemented regular expression language:
  - no negative lookahead: `(?!nope)`
  - matches always start from the start of the string: `/^always/`
  - string recognition is implemented as a series of potentially-nested commands rather than state transitions within a finite automaton.
  - no flags:
    - no case-insensitive matching: `/NOPE/i`
    - no multiline mode: `nope$`
- Using these types likely slows down builds
<!-- TODO: quantify the cost of compile-time RegExp matching -->

# Usage

This is pre-alpha software: the API will change without warning, the implementation is brittle and incomplete, and it has not been optimized.

If you're brave, you can:

- copy-paste `src/index.d.ts` and `src/internal.d.ts` into your codebase
- `pnpm add -D "git+https://github.com/skalt/brzozowski-ts.git"`

# Design

Compile-time parsing follows this general algorithm: 0. Given a constant string type `S` and a regular expression string type `R`

1. take the derivative of `R` with respect the start of `S` to produce a shorter regular expression `r` and a shorter string `s`
2. recur using `s` and `r`
3. when `r` is empty, the entire regular expression has been matched.
4. if `s` is empty and `r` is not, the expression has not been matched

<!-- links -->

[wiki]: https://en.wikipedia.org/wiki/Brzozowski_derivative
[ts-issue]: https://github.com/microsoft/TypeScript/issues/41160#issuecomment-1503653578
