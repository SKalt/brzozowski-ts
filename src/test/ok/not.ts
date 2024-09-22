import {
  DerivePattern,
  Many0,
  Many0NotChars,
  Many1NotChars,
  NotChars,
  RecognizeTotalPattern,
} from "../..";
import { Eq } from "../../utils";

{
  const nope: Eq<NotChars<"a" | "z", "abc">, never> = true;
  const anyOtherWorks: Eq<NotChars<"a" | "z", "bcd">, "cd"> = true;
  const emptyOk: Eq<NotChars<"a" | "z", "">, ""> = true;
}

{
  const nope: Eq<DerivePattern<"[^a-z]", "abc">, never> = true;
  const ok: Eq<DerivePattern<"[^a-z]", "123">, "23"> = true;
  const digitShouldMatchNonAlpha: Eq<DerivePattern<"[^a-z]", "1">, ""> = true;
  const spaceShouldMatchNonAlpha: Eq<DerivePattern<"[^a-z]", " ">, ""> = true;
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
  const oneIsNotAb: RecognizeTotalPattern<"[^ab]", "1"> = true;
  const oneIsNotAbc: RecognizeTotalPattern<"[^a-z]", "1"> = true;
  const spaceIsNotAlpha: RecognizeTotalPattern<"[^a-z]", " "> = true;
  const nonAlphaOk: RecognizeTotalPattern<"[^a-z]+", "1"> = true;
  const ok: RecognizeTotalPattern<"[^a-zA-Z]+", "1 2 3"> = true;
}
