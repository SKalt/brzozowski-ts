import type { Compile, Exec } from "../src";
import { Recognize } from "../src/re";

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
