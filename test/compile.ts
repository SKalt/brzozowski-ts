import { Digit, Word } from "../src/char";
import {
  CaptureRef,
  DotAll,
  Err,
  Group,
  Plus,
  Prefix,
  Union as CharUnion,
  Quantifier,
  RE,
  Repeat,
} from "../src/re/ir";
import { Compile } from "../src/re/compile";
import { Eq } from "../src/utils";

{
  type Actual = Compile<"\\a">;
  const _: Eq<Actual, RE<[Prefix<"a">]>> = true;
}
{
  type Actual = Compile<"\\t">;
  const _: Eq<Actual, RE<[Prefix<"\t">]>> = true;
}
{
  type Actual = Compile<"\\n">;
  const _: Eq<Actual, RE<[Prefix<"\n">]>> = true;
}
{
  type Actual = Compile<"\\r">;
  const _: Eq<Actual, RE<[Prefix<"\r">]>> = true;
}
{
  type Actual = Compile<"\\w">;
  const _: Eq<Actual, RE<[CharUnion<Word>]>> = true;
}
{
  type Actual = Compile<"\\)">;
  const _: Eq<Actual, RE<[Prefix<")">]>> = true;
}
{
  type Actual = Compile<"[0-9]+">;
  const _: Eq<Actual, RE<[Repeat<CharUnion<Digit>, Plus>]>> = true;
}
{
  type Actual = Compile<"[0-9]{3}">;
  const _: Eq<Actual, RE<[Repeat<CharUnion<Digit>, Quantifier<3, 3>>]>> = true;
}
{
  type Actual = Compile<"[0-9]{3,}">;
  const _: Eq<Actual, RE<[Repeat<CharUnion<Digit>, Quantifier<3>>]>> = true;
}
{
  type Actual = Compile<"">;
  const _: Actual extends Err<"empty pattern"> ? true : false = true;
}
{
  type Actual = Compile<"a.c">;
  const _: Eq<Actual, RE<[Prefix<"a">, DotAll, Prefix<"c">]>> = true;
}
{
  type Actual = Compile<"(a)">;
  {
    const _: Actual["captures"] = [0];
  }
  {
    const _: Eq<Actual["names"], never> = true;
  }
  {
    const _: keyof Actual["parts"][0] = "pattern";
  }
  const _: Eq<Actual, RE<[Group<RE<[Prefix<"a">]>>], [0]>> = true;
}
{
  type Actual = Compile<"\\)">;
  const _: Eq<Actual, RE<[Prefix<")">]>> = true;
}
{
  type Actual = Compile<"(\\))">;
  const _: Eq<Actual, RE<[Group<RE<[Prefix<")">]>>], [0]>> = true;
}
{
  type Actual = Compile<"(a)(b)">;
  const _: Eq<
    Actual,
    RE<[Group<RE<[Prefix<"a">]>>, Group<RE<[Prefix<"b">]>>], [0, 1]>
  > = true;
}
{
  type Actual = Compile<"(?<A>a)">;
  const _: Eq<Actual, RE<[Group<RE<[Prefix<"a">]>, "A">], [0], "A">> = true;
}

{
  type Actual = Compile<"(?<A>a(?<B>b))">;
}
{
  type MyRe = Compile<"(a(b))\\1\\2">;
  type Actual =
    MyRe["parts"] extends [...infer _, infer Prev, infer Last] ? [Prev, Last]
    : never;
  {
    const _: Eq<Actual[0], CaptureRef<1>> = true;
  }
  {
    const _: Eq<Actual[1], CaptureRef<2>> = true;
  }
}

{
  type MyRe = Compile<"(a(b)(?:c(d)))">;
  //                      1      2
  //                   0 ------------
  // type Actual = NCapturesOf<MyRe["parts"]>["length"];
  type _ = MyRe["captures"];
  const n: MyRe["captures"]["length"] = 3;
}

{
  type MyRe = Compile<"(a(b)(?:c(d)))">;
  type _captures = MyRe["captures"];
}
