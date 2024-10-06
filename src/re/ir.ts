// export type Noop = { noop: true };
export type Prefix<Prefix extends string> = { prefix: Prefix };
export type CaptureRef<Index extends number> = { captureRef: Index };
/** Matches a single character */
export type Union<
  Union extends string = never,
  Avoid extends string = never,
> = {
  match: Union;
  avoid: Avoid;
};
export type DotAll = Union<string, never>;
// ^unions need to be kept separate from prefixes, otherwise they'll distribute:
// e.g. type U = `a${"x" | "y"}` == `ax` | `ay`, which messes up matching repeated
// sequences like /a\d+/

export type Repeat<I, Q extends Quantifier<any, any>> = {
  instruction: I;
  quantifier: Q;
};
export type Quantifier<Min extends number, Max extends number | null = null> = {
  min: Min;
  max: Max;
};
export type Star = Quantifier<0>;
export type Plus = Quantifier<1>;
export type Optional = Quantifier<0, 1>;

export type Err<Msg extends string> = { error: Msg };

export type Group<
  Pattern extends RE<any, string> = RE<[]>,
  Name extends string | null = null,
  Kind extends GroupKind = GroupKind.Capturing,
> = {
  kind: Kind;
  name: Name;
  pattern: Pattern;
};

export const enum GroupKind {
  NonCapturing,
  Capturing,
  Lookahead,
  NegativeLookahead,
  Lookbehind,
  NegativeLookbehind,
}

export type RE<
  Parts extends readonly [...unknown[]],
  CaptureNames extends string = never,
> = {
  parts: Parts;
  names: CaptureNames;
};

export type Alternation<Branches extends readonly [...unknown[]]> = {
  branches: Branches;
};
