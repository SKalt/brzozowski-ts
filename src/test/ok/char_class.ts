import { CharClass } from "../..";
import { AsciiLowercase, Digit } from "../../char";
import { Assert, Eq } from "../../utils";

const _cc0: Assert<Eq<CharClass<"abc">, "a" | "b" | "c">> = true;
const _cc1: Assert<Eq<CharClass<"a-zX">, AsciiLowercase | "X">> = true;
const _cc2: Assert<Eq<CharClass<"Xa-z">, AsciiLowercase | "X">> = true;
const _cc3: Assert<Eq<CharClass<"0-9a-z">, Digit | AsciiLowercase>> = true;
