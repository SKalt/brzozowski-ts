import { Exec } from "../src/re/match";
import { _Match, REMatch } from "../src/re/match/internal";
import { _JoinMatches } from "../src/re/match/internal/repeat";
import { Compile } from "../src/re/compile";
import { Eq, JoinTuple } from "../src/utils";
{
  type Actual = _JoinMatches<[_Match<"a", "bc">, _Match<"b", "c">]>;
  const _: Eq<Actual, "ab"> = true;
}
{
  type MyRegex = Compile<"(a(b(c))(d))">;
  //                    0 --~~~~~~----
  //                          2    3
  type Actual = Exec<MyRegex, "abcd">;
  const matched: Actual["matched"] = "abcd";
  const captures: Actual["captures"] = ["abcd", "bc", "c", "d"];
}
{
  type MyRegex = Compile<"a(b)">;
  type Actual = Exec<MyRegex, "ab">;
}
{
  type MyRegex = Compile<"a(b)">;
  type Actual = Exec<MyRegex, "ab">;
  const matched: Actual["matched"] = "ab";
  const captures: Actual["captures"] = ["b"];
  const rest: Actual["rest"] = "";
  const namedCaptures: Actual["groups"] = {};
}
{
  type MyRegex = Compile<"a(?<B>b)c">;
  type Actual = Exec<MyRegex, "abc">;
  const _: Eq<Actual, REMatch<"abc", "", ["b"], { B: "b" }>> = true;
}

{
  type MyRegex = Compile<"a">;
  {
    type Actual = Exec<MyRegex, "ab">;
    const _: Eq<Actual, REMatch<"a", "b">> = true;
  }
  {
    type Actual = Exec<MyRegex, "bc">;
    const _: Eq<
      Actual,
      { error: "string does not match prefix"; str: "bc"; prefix: "a" }
    > = true;
  }
}

{
  type MyRegex = Compile<"a|b">;
  {
    type Actual = Exec<MyRegex, "a">;
    const _: Eq<Actual, REMatch<"a", "", []>> = true;
  }
  {
    type Actual = Exec<MyRegex, "b">;
    const _: Eq<Actual, REMatch<"b", "", []>> = true;
  }
  {
    type Actual = Exec<MyRegex, "c">;
    const _: Eq<Actual, { error: "no branches match" }> = true;
  }
}
{
  type MyRegex = Compile<"a.c">;
  type Actual = Exec<MyRegex, "abc">;
  const _: Eq<Actual, REMatch<"abc", "">> = true;
}

{
  type MyRegex = Compile<"a(b)\\1">;
  type Actual = Exec<MyRegex, "abb">;
  const _: Eq<Actual, REMatch<"abb", "", ["b"]>> = true;
}
{
  type MyRegex = Compile<"a(b)(c)">;
  type Match = Exec<MyRegex, "abc">;
  const matched: Match["matched"] = "abc";
  const captures: Match["captures"] = ["b", "c"];
}

{
  type Actual = JoinTuple<["a", "b", "c"]>;
  const _: Eq<Actual, "abc"> = true;
}

{
  type MyRegex = Compile<"a{2,3}">;
  {
    const ok: Exec<MyRegex, "aaa">["matched"] = "aaa";
  }
  {
    const ok: Exec<MyRegex, "aaaa">["matched"] = "aaa";
  }
  {
    const ok: Exec<MyRegex, "aa">["matched"] = "aa";
  }
  {
    const ok: Exec<MyRegex, "a">["error"] = "string does not match prefix";
  }
}
{
  type MyRegex = Compile<"a+?">;
  {
    const ok: Exec<MyRegex, "aa">["matched"] = "a";
  }
  {
    const ok: Exec<MyRegex, "aaa">["matched"] = "a";
  }
  {
    const ok: Exec<MyRegex, "">["error"] = "string does not match prefix";
  }
}
{
  type MyRegex = Compile<"a*?">;
  {
    const ok: Exec<MyRegex, "aa">["matched"] = "";
  }
  {
    const ok: Exec<MyRegex, "aaa">["matched"] = "";
  }
  {
    const ok: Exec<MyRegex, "">["matched"] = "";
  }
}
{
  type MyRegex = Compile<"a?b">;
  {
    const ok: Exec<MyRegex, "ab">["matched"] = "ab";
  }
  {
    const ok: Exec<MyRegex, "b">["matched"] = "b";
  }
  {
    const ok: Exec<MyRegex, "a">["error"] = "string does not match prefix";
  }
}

{
  type MyRegex = Compile<"A+">;
  type Result = Exec<
    MyRegex,
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
  >;
  const ok: "matched" extends keyof Result ? true : false = true;
}
