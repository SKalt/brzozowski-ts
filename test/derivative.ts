import { _Match } from "../src/re/match/internal";
import { _Derivative } from "../src/re/match/internal/derivative";
import { Eq } from "../src/utils";

{
  type Actual = _Derivative<"abc", "a">;
  const _: Eq<Actual, _Match<"a", "bc">> = true;
}
{
  type Actual = _Derivative<"abc", "a" | "b">;
  const _: Eq<Actual, _Match<"a", "bc">> = true;
}
