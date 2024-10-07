import { Derivative } from "../../src/internal";
import { Digit } from "../../src/char";
import { Eq } from "../../src/utils";

{
  type Actual = Derivative<"a", "abc">;
  const _: Eq<Actual, "bc"> = true;
}

{
  type Actual = Derivative<"a", "bc">;
  const _: Eq<Actual, never> = true;
}

{
  type Actual = Derivative<"", "bc">;
  const _: Eq<Actual, never> = true;
}

{
  type Actual = Derivative<"", "">;
  const _: Eq<Actual, never> = true;
}

{
  type Actual = Derivative<Digit, "123abc">;
  const _: Eq<Actual, "23abc"> = true;
}

{
  type Actual = Derivative<"c", "cow" | "cat" | "dog">;
  const _: Eq<Actual, "at" | "ow"> = true;
}

{
  type Actual = Derivative<"c" | "d", "cat">;
  const _: Eq<Actual, "at"> = true;
}
