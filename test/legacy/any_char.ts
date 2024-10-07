import { AnyChar } from "../../src/internal";

{
  type Actual = AnyChar<"abc">;
  const _: Actual = "bc";
}

{
  type Actual = AnyChar<"">;
  const _: Actual = "";
}
