import type { Compile, Exec, Recognize } from "../src";

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
