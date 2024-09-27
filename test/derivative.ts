import { Derivative } from "../src/internal";
import { Digit } from "../src/char";
import { Eq } from "../src/utils";

{
  const _p0: Eq<Derivative<"a", "abc">, "bc"> = true;
  const _p1: Eq<Derivative<"a", "bc">, never> = true;
  const _p2: Eq<Derivative<"", "bc">, never> = true;
  const _p3: Eq<Derivative<"", "">, never> = true;
  const _p4: Eq<Derivative<Digit, "123abc">, "23abc"> = true;
  const _p5: Eq<Derivative<"c", "cow" | "cat" | "dog">, "at" | "ow"> = true;
  const _p6: Eq<Derivative<"c" | "d", "cat">, "at"> = true;
}
