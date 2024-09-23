import type { IsCompleteMatch } from "../src/index";
import type { Assert, Eq } from "../src/utils";
type IsHexStr<S extends string> = IsCompleteMatch<`[0-9abcdef]+`, S>;
{
  const abcIsHex: Assert<Eq<IsHexStr<"abc">, true>> = true;
  const abzIsNotHex: Assert<Eq<IsHexStr<"abz">, false>> = true;
}

type HexStr<S extends string> =
  IsCompleteMatch<`[0-9abcdef]+`, S> extends true ? S
  : `${S} is not a hex string`;

export const mustBeHex = <S extends string>(s: HexStr<S>) => s;
mustBeHex("abc"); // ok

// @ts-expect-error: "abz" is not a valid hex string
mustBeHex("abz");
// @ts-expect-error: "abz" is not a valid hex string
mustBeHex("abz" as string);
