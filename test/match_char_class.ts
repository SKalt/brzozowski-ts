import { Err } from "../src/re/ir";
import { _Match } from "../src/re/match/internal";
import { _ExecCharUnion } from "../src/re/match/internal/char_union";
import { Eq } from "../src/utils";

{
  type Actual = _ExecCharUnion<"abc", "a" | "b", never>;
  const _: Actual extends _Match<"a", "bc"> ? true : false = true;
}
{
  type Actual = _ExecCharUnion<"abc", never, never>;
  const _: Actual extends Err<"empty union"> ? true : false = true;
}
{
  type Actual = _ExecCharUnion<"xbc", never, "a">;
  const _: Eq<Actual, _Match<"x", "bc">> = true;
}
{
  type Actual = _ExecCharUnion<"bc", never, "a">;
  const _: Actual extends _Match<"b", "c"> ? true : false = true;
}
{
  type Actual = _ExecCharUnion<"bc", "a", "b">;
}
