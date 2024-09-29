import { AnyChar } from "../src/internal";
import { Eq } from "../src/utils";

{
  type Actual = AnyChar<"abc">;
  const _: Eq<Actual, "bc"> = true;
}

{
  type Actual = AnyChar<"">;
  const _: Eq<Actual, ""> = true;
}
