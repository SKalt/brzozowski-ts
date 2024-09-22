import { CharClass, DerivePattern, RecognizeTotalPattern } from "../..";
import { AsciiLowercase, Digit } from "../../char";
import { Assert, Eq } from "../../utils";

{
  const unionWorks: Eq<CharClass<"abc">, "a" | "b" | "c"> = true;
  const lowerAsciiWorks: Eq<CharClass<"a-zX">, AsciiLowercase | "X"> = true;
  const rangePlusUnion: Eq<CharClass<"Xa-z">, AsciiLowercase | "X"> = true;
  const multiRangeOk: Eq<CharClass<"0-9a-z">, Digit | AsciiLowercase> = true;
}

{
  const aOk: RecognizeTotalPattern<"[a-z]", "a"> = true;
  const bOk: RecognizeTotalPattern<"[a-z]", "b"> = true;
  const multiOk: RecognizeTotalPattern<"[a-z]+", "abc"> = true;
  const multiFail: RecognizeTotalPattern<"[a-z]+", "abc1"> = false;
  const multiEmptyOk: RecognizeTotalPattern<"[a-z]*", "A1"> = false;
}
