import type { Compile, Exec } from "../src";
import { Recognize } from "../src/re";

type HexStrRE = Compile<"[0-9A-Fa-f]{5,}">;
type HexStr<S extends string> = Recognize<HexStrRE, S>;
type nope = HexStr<"xxxxx">;

const mustBeHex = <S extends string>(hexStr: HexStr<S>) => hexStr;
mustBeHex("abc123"); // => "abc123"
// @ts-expect-error: "${string}" is not a valid hex string
mustBeHex("xyz q"); // => type error
