import { Many0, Many1 } from "../..";
import { Digit } from "../../char";
import { Assert, Eq } from "../../utils";

{
  const _m0: Assert<Eq<Many0<"a", "aab">, "b">> = true;
  const _m2: Assert<Eq<Many0<"x", "abc">, "abc">> = true;
  const _m5: Assert<Eq<Many0<Digit, "123abc">, "abc">> = true;
}

{
  const _m1: Assert<Eq<Many1<"a", "aab">, "b">> = true;
  const _m3: Assert<Eq<Many1<"x", "abc">, never>> = true;
  const _m4: Assert<Eq<Many1<Digit, "123abc">, "abc">> = true;
}
