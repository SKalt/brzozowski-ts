import { Parse } from "../src/re/parse/char_class";
import { Eq } from "../src/utils";
import { Union as CharUnion } from "../src/re/ir";
import { AsciiLowercase, Digit } from "../src/char";
{
  type Actual = Parse<null, "a-z]">;
  const _: Eq<Actual, [CharUnion<AsciiLowercase>, ""]> = true;
}
{
  type Actual = Parse<null, "a-z0-9]">;
  const _: Eq<Actual, [CharUnion<AsciiLowercase | Digit>, ""]> = true;
}
{
  type Actual = Parse<null, "0-9A]">;
  const _: Eq<Actual, [CharUnion<Digit | "A">, ""]> = true;
}
{
  type Actual = Parse<null, "0-]">;
  const _: Eq<Actual, [CharUnion<"0" | "-">, ""]> = true;
}
{
  type Actual = Parse<null, "0-">;
  const _: Eq<Actual, { error: "unterminated char class" }> = true;
}

{
  type Actual = Parse<null, "a-d]">;
  const _: Eq<Actual, [CharUnion<"a" | "b" | "c" | "d">, ""]> = true;
}
