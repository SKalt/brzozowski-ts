import { Quantifier } from "../src/re/ir";
import { Parse } from "../src/re/parse/quantifier";
import { Eq } from "../src/utils";

{
  type Actual = Parse<null, "3}">;
  const _: Eq<Actual, [Quantifier<3, 3>, ""]> = true;
}
{
  type Actual = Parse<null, "3,}">;
  const _: Eq<Actual, [Quantifier<3>, ""]> = true;
}
{
  type Actual = Parse<null, "3,4}">;
  const _: Eq<Actual, [Quantifier<3, 4>, ""]> = true;
}
{
  type Actual = Parse<null, "Infinity}">;
  const _: Eq<Actual, { error: "infinite quantifier" }> = true;
}
{
  type Actual = Parse<null, "-3}">;
  const _: Eq<Actual, { error: "negative quantifier" }> = true;
}
{
  type Actual = Parse<null, "}">;
  const _: Eq<Actual, { error: "empty quantifier" }> = true;
}
{
  type Actual = Parse<[1], "}">;
  const _: Eq<Actual, [Quantifier<1, 1>, ""]> = true;
}
{
  type Actual = Parse<[1], "3}">;
  const _: Eq<Actual, [Quantifier<1, 3>, ""]> = true;
}
