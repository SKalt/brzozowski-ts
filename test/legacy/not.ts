import { DeriveWRTRegExp, IsCompleteMatch } from "../../src";
import { Many0NotChars, Many1NotChars, NotChars } from "../../src/internal";
import { Eq } from "../../src/utils";

{
  type Actual = NotChars<"a" | "z", "abc">;
  const _: Eq<Actual, never> = true;
}

{
  type Actual = NotChars<"a" | "z", "bcd">;
  const _: Eq<Actual, "cd"> = true;
}

{
  type Actual = NotChars<"a" | "z", "">;
  const _: Eq<Actual, ""> = true;
}

{
  type Actual = DeriveWRTRegExp<"[^a-z]", "abc">;
  const _: Eq<Actual, never> = true;
}

{
  type Actual = DeriveWRTRegExp<"[^a-z]", "123">;
  const _: Eq<Actual, "23"> = true;
}

{
  type Actual = DeriveWRTRegExp<"[^a-z]", "1">;
  const _: Eq<Actual, ""> = true;
}

{
  type Actual = DeriveWRTRegExp<"[^a-z]", " ">;
  const _: Eq<Actual, ""> = true;
}

{
  type Actual = DeriveWRTRegExp<"[^a-z]", "1">;
  const _: Eq<Actual, ""> = true;
}

{
  type Actual = Many1NotChars<"a" | "z", "abc">;
  const _: Eq<Actual, never> = true;
}

{
  type Actual = Many0NotChars<"a" | "z", "123">;
  const _: Eq<Actual, ""> = true;
}

{
  type Actual = Many0NotChars<"a" | "z", "1">;
  const _: Eq<Actual, ""> = true;
}

{
  type Actual = Many0NotChars<"a" | "z", "1a2b3c">;
  const _: Eq<Actual, "a2b3c"> = true;
}

{
  type Actual = Many1NotChars<"a" | "z", "1a2b3c">;
  const _: Eq<Actual, "a2b3c"> = true;
}

{
  type Actual = DeriveWRTRegExp<"[^a-z]+", "1">;
  const _: Eq<Actual, ""> = true;
}

{
  type Actual = DeriveWRTRegExp<"[^a-z]", "1">;
  const _: Eq<Actual, ""> = true;
}
{
  type Actual = DeriveWRTRegExp<"[^a-z]", " ">;
  const _: Eq<Actual, ""> = true;
}

{
  type Actual = DeriveWRTRegExp<"[^a-z]+", "1">;
  const _: Eq<Actual, ""> = true;
}

{
  type Actual = DeriveWRTRegExp<"[^a-zA-Z]+", "1 2 3">;
  const _: Eq<Actual, ""> = true;
}
