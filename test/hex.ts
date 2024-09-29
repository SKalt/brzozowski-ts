import type { IsCompleteMatch } from "../src/index";
import type { Eq } from "../src/utils";
type IsHexStr<S extends string> = IsCompleteMatch<`[\\dabcdef]+`, S>;
{
  const abcIsHex: Eq<IsHexStr<"0123456789abcdef">, true> = true;
  const abzIsNotHex: Eq<IsHexStr<"abz">, false> = true;
}

type HexStr<S extends string> =
  IsCompleteMatch<`[\\dabcdef]+`, S> extends true ? S
  : `${S} is not a hex string`;

export const mustBeHex = <S extends string>(s: HexStr<S>) => s;
mustBeHex("0123456789abcdef"); // ok

// @ts-expect-error: "abz" is not a valid hex string
mustBeHex("abz");
// @ts-expect-error: "${string}" is not a valid hex string
mustBeHex("abz" as string);
