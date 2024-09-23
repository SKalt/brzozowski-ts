import { IsCompleteMatch } from "../src";
import { AsciiLowercase, Digit } from "../src/char";
import { CharClass } from "../src/internal";
import { Assert, Eq } from "../src/utils";

{
  const unionWorks: Eq<CharClass<"abc">, "a" | "b" | "c"> = true;
  const lowerAsciiWorks: Eq<CharClass<"a-zX">, AsciiLowercase | "X"> = true;
  const rangePlusUnion: Eq<CharClass<"Xa-z">, AsciiLowercase | "X"> = true;
  const multiRangeOk: Eq<CharClass<"0-9a-z">, Digit | AsciiLowercase> = true;
}

{
  const aOk: IsCompleteMatch<"[a-z]", "a"> = true;
  const bOk: IsCompleteMatch<"[a-z]", "b"> = true;
  const multiOk: IsCompleteMatch<"[a-z]+", "abc"> = true;
  const multiFail: IsCompleteMatch<"[a-z]+", "abc1"> = false;
  const multiEmptyOk: IsCompleteMatch<"[a-z]*", "A1"> = false;
}
