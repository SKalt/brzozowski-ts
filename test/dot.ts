import { DeriveWRTRegExp } from "../src";
import { Eq } from "../src/utils";

{
  type Actual = DeriveWRTRegExp<".", "a">;
  const matchesLetters: Eq<Actual, ""> = true;
}

{
  type Actual = DeriveWRTRegExp<".", "0">;
  const matchesNumbers: Eq<Actual, ""> = true;
}

{
  type Actual = DeriveWRTRegExp<".", "⭐">;
  const evenMatchesEmoji: Eq<Actual, ""> = true;
}
