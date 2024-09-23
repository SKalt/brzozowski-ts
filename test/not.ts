import { DeriveWRTRegExp, IsCompleteMatch } from "../src";
import { Many0NotChars, Many1NotChars, NotChars } from "../src/internal";
import { Eq } from "../src/utils";

{
  const nope: Eq<NotChars<"a" | "z", "abc">, never> = true;
  const anyOtherWorks: Eq<NotChars<"a" | "z", "bcd">, "cd"> = true;
  const emptyOk: Eq<NotChars<"a" | "z", "">, ""> = true;
}

{
  const nope: Eq<DeriveWRTRegExp<"[^a-z]", "abc">, never> = true;
  const ok: Eq<DeriveWRTRegExp<"[^a-z]", "123">, "23"> = true;
  const digitShouldMatchNonAlpha: Eq<DeriveWRTRegExp<"[^a-z]", "1">, ""> = true;
  const spaceShouldMatchNonAlpha: Eq<DeriveWRTRegExp<"[^a-z]", " ">, ""> = true;
  // const doesNotMatchInverse: RecognizeTotalPattern<"[^a-z]", "1"> = true;
}

{
  const nope: Eq<Many1NotChars<"a" | "z", "abc">, never> = true;
  const ok: Eq<Many0NotChars<"a" | "z", "123">, ""> = true;
  const digitShouldMatchNonAlpha: Eq<Many0NotChars<"a" | "z", "1">, ""> = true;
  const partialMatch0: Eq<Many0NotChars<"a" | "z", "1a2b3c">, "a2b3c"> = true;
  const partialMatch1: Eq<Many1NotChars<"a" | "z", "1a2b3c">, "a2b3c"> = true;
}

{
  const oneIsNotAb: IsCompleteMatch<"[^ab]", "1"> = true;
  const oneIsNotAbc: IsCompleteMatch<"[^a-z]", "1"> = true;
  const spaceIsNotAlpha: IsCompleteMatch<"[^a-z]", " "> = true;
  const nonAlphaOk: IsCompleteMatch<"[^a-z]+", "1"> = true;
  const ok: IsCompleteMatch<"[^a-zA-Z]+", "1 2 3"> = true;
}
