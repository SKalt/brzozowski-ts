import { Opt } from "../../src/internal";
import { Eq } from "../../src/utils";
{
  const _o0: Eq<Opt<"x", "abc">, "abc"> = true;
  const _o1: Eq<Opt<"a", "abc">, "bc"> = true;
  const _o2: Eq<Opt<"c" | "d", "cat">, "at"> = true;
}
