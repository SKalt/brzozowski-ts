import type { DeriveWRTRegExp } from "../src";
import { Eq } from "../src/utils";

{
  type Actual = DeriveWRTRegExp<"\\d", "0">;
  const _: Eq<Actual, ""> = true;
}
