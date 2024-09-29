import { DeriveWRTRegExp, IsCompleteMatch } from "../src";
import { Many0NotChars, Many1NotChars, NotChars } from "../src/internal";
import { Eq } from "../src/utils";

{
  type Actual = NotChars<"a" | "z", "abc">;
  const nope: Eq<Actual, never> = true;
}

{
  type Actual = NotChars<"a" | "z", "bcd">;
  const anyOtherWorks: Eq<Actual, "cd"> = true;
}

{
  type Actual = NotChars<"a" | "z", "">;
  const emptyOk: Eq<Actual, ""> = true;
}

{
  type Actual = DeriveWRTRegExp<"[^a-z]", "abc">;
  const nope: Eq<Actual, never> = true;
}

{
  type Actual = DeriveWRTRegExp<"[^a-z]", "123">;
  const ok: Eq<Actual, "23"> = true;
}

{
  type Actual = DeriveWRTRegExp<"[^a-z]", "1">;
  const digitShouldMatchNonAlpha: Eq<Actual, ""> = true;
}

{
  type Actual = DeriveWRTRegExp<"[^a-z]", " ">;
  const spaceShouldMatchNonAlpha: Eq<Actual, ""> = true;
}

{
  type Actual = DeriveWRTRegExp<"[^a-z]", "1">;
  const doesNotMatchInverse: Eq<Actual, ""> = true;
}

{
  type Actual = Many1NotChars<"a" | "z", "abc">;
  const nope: Eq<Actual, never> = true;
}

{
  type Actual = Many0NotChars<"a" | "z", "123">;
  const ok: Eq<Actual, ""> = true;
}

{
  type Actual = Many0NotChars<"a" | "z", "1">;
  const digitShouldMatchNonAlpha: Eq<Actual, ""> = true;
}

{
  type Actual = Many0NotChars<"a" | "z", "1a2b3c">;
  const partialMatch0: Eq<Actual, "a2b3c"> = true;
}

{
  type Actual = Many1NotChars<"a" | "z", "1a2b3c">;
  const partialMatch1: Eq<Actual, "a2b3c"> = true;
}

{
  type Actual = DeriveWRTRegExp<"[^a-z]+", "1">;
  const oneIsNotAb: Eq<Actual, ""> = true;
}

{
  type Actual = DeriveWRTRegExp<"[^a-z]", "1">;
  const oneIsNotAbc: Eq<Actual, ""> = true;
}
{
  type Actual = DeriveWRTRegExp<"[^a-z]", " ">;
  const spaceIsNotAlpha: Eq<Actual, ""> = true;
}

{
  type Actual = DeriveWRTRegExp<"[^a-z]+", "1">;
  const nonAlphaOk: Eq<Actual, ""> = true;
}

{
  type Actual = DeriveWRTRegExp<"[^a-zA-Z]+", "1 2 3">;
  const ok: Eq<Actual, ""> = true;
}
