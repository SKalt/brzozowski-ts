import { DeriveWRTRegExp, IsCompleteMatch } from "../src";
import { AsciiLowercase, Digit } from "../src/char";
import { CharClass } from "../src/internal";
import { Eq } from "../src/utils";

{
  type Actual = CharClass<"abc">;
  const _: Eq<Actual, "a" | "b" | "c"> = true;
}

{
  type Actual = CharClass<"a-zX">;
  const _: Eq<Actual, AsciiLowercase | "X"> = true;
}

{
  type Actual = CharClass<"Xa-z">;
  const _: Eq<Actual, AsciiLowercase | "X"> = true;
}

{
  type Actual = CharClass<"0-9a-z">;
  const _: Eq<Actual, Digit | AsciiLowercase> = true;
}

{
  type Actual = DeriveWRTRegExp<"[a-z]", "a">;
  const _: Eq<Actual, ""> = true;
}
{
  type Actual = DeriveWRTRegExp<"[a-z]", "z">;
  const _: Eq<Actual, ""> = true;
}
{
  type Actual = DeriveWRTRegExp<"[a-z]+", "abc">;
  const _: Eq<Actual, ""> = true;
}
{
  type Actual = DeriveWRTRegExp<"[a-z]+", "abc1">;
  const _: Eq<Actual, "1"> = true;
}
{
  type Actual = DeriveWRTRegExp<"[a-z]*", "A1">;
  const _: Eq<Actual, "A1"> = true;
}

{
  type Actual = DeriveWRTRegExp<"\\w", "a">;
  const _: Eq<Actual, ""> = true;
}

{
  type Actual = DeriveWRTRegExp<"\\w", "_">;
  const _: Eq<Actual, ""> = true;
}

{
  type Actual = DeriveWRTRegExp<"\\w", "0">;
  const _: Eq<Actual, ""> = true;
}

{
  type Actual = DeriveWRTRegExp<"\\w+", "abc_ABC_123">;
  const _: Eq<Actual, ""> = true;
}

{
  type Actual = DeriveWRTRegExp<"\\w+", "abc 1">;
  const _: Eq<Actual, " 1"> = true;
}

{
  type Actual = DeriveWRTRegExp<"\\w*", "A 1">;
  const _: Eq<Actual, " 1"> = true;
}
