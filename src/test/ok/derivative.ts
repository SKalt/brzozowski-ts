import { Derivative, RecognizeDerivative } from "../..";
import { Digit } from "../../char";
import { Assert, Eq } from "../../utils";

{
  const _p0: Assert<Eq<Derivative<"a", "abc">, "bc">> = true
  const _p1: Assert<Eq<Derivative<"a", "bc">, never>> = true
  const _p2: Assert<Eq<Derivative<"", "bc">, never>> = true
  const _p3: Assert<Eq<Derivative<"", "">, never>> = true
  const _p4: Assert<Eq<Derivative<Digit, "123abc">, "23abc">> = true
  const _p5: Assert<Eq<Derivative<"c", "cow" | "cat" | "dog">, "at" | "ow">> = true
  const _p6: Assert<Eq<Derivative<"c" | "d", "cat">, "at">> = true
}

{
  const _r0: Assert<Eq<RecognizeDerivative<"a", "abc">, false>> = true;
  const _r1: Assert<Eq<RecognizeDerivative<"a", "a">, true>> = true;
}
