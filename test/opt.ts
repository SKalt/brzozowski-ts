import { Opt } from "../src/internal";
import { Assert, Eq } from "../src/utils";
{
  const _o0: Assert<Eq<Opt<"x", "abc">, "abc">> = true;
  const _o1: Assert<Eq<Opt<"a", "abc">, "bc">> = true;
  const _o2: Assert<Eq<Opt<"c" | "d", "cat">, "at">> = true;
}
