# `brzozowski-ts`

An experiment in implementing static checks of regular expressions in Typescript using [Brzozowski derivatives][wiki].

This relates to [Typescript's RegEx-validated string types issue][ts-issue].

# Use case

This allows you to make assertions about constants:

```ts
type HexStr<S extends string> =
  RecognizePattern<`[0-9abcdef]+`, S> extends true ? S
  : `${S} is not a hex string`;

const foo = <S extends string>(s: HexStr<S>): void => {};
foo("abc"); // ok!
foo("abz");
//   ~~~
// error: Argument of type '"abz"' is not assignable to
// parameter of type '"abz is not a hex string"'
```

## Limitations

- `RecognizePattern<RE, Str>` uses a **very** limited and poorly-implemented regular expression language:
  - only `a-z`, `A-Z`, and `0-9` are recognized in char class literals `[0-9a-zA-Z]`, no partial ranges like `a-f`
  - no common character classes outside of char class literals: `\d\s\w` etc.
  - no negated char classes: `[^nope]`
  - no named capture groups: `(?<nope>)`
  - no negative lookahead: `(?!nope)`
  - no nested capture groups: `(no(pe))`
  - no alternation: `no|pe`
  - no quantified repetition `[0-9]{3,6}`
  - no partial matches: every pattern is implicitly total `/^always$/`
- Using these types likely slows down builds
<!-- TODO: quantify the cost of compile-time RegExp matching -->

# Usage

Don't. This is a hack, it's brittle, and it's pre-alpha: the API will change without warning.

If you must, either

- copy-paste `src/index.d.ts` into your codebase
- `pnpm add -D "git+https://github.com/this/repo"`

# Design

Compile-time parsing follows this general algorithm: 0. Given a constant string type `S` and a regular expression string type `R`

1. take the derivative of `R` with respect the start of `S` to produce a shorter regular expression `r` and a shorter string `s`
2. recur using `s` and `r`
3. when `r` is empty, the entire regular expression has been matched.
4. if `s` is empty and `r` is not, the expression has not been matched

<!-- links -->

[wiki]: https://en.wikipedia.org/wiki/Brzozowski_derivative
[ts-issue]: https://github.com/microsoft/TypeScript/issues/41160#issuecomment-1503653578
