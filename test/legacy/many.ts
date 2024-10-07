import { Many0, Many1 } from "../../src/internal";
import { Digit } from "../../src/char";
import { Eq } from "../../src/utils";

{
  type Actual = Many0<"a", "aab">;
  const _: Eq<Actual, "b"> = true;
}

{
  type Actual = Many0<"x", "abc">;
  const _: Eq<Actual, "abc"> = true;
}

{
  type Actual = Many0<Digit, "123abc">;
  const _: Eq<Actual, "abc"> = true;
}

{
  type Actual = Many1<"a", "aab">;
  const _: Eq<Actual, "b"> = true;
}

{
  type Actual = Many1<"x", "abc">;
  const _: Eq<Actual, never> = true;
}

{
  type Actual = Many1<Digit, "123abc">;
  const _: Eq<Actual, "abc"> = true;
}

{
  type Actual = Many0<Digit, "abc">;
  const _: Eq<Actual, "abc"> = true;
}
