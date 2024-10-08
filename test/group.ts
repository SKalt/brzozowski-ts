import { Err, Group, GroupKind, Prefix, RE } from "../src/re/ir";
import { Eq } from "../src/utils";
import {
  _GroupMeta,
  _ParseGroup,
  _ParseGroupMeta,
} from "../src/re/parse/group";
{
  type Actual = _ParseGroupMeta<"">;
  const _: Eq<Actual, Err<"unterminated group">> = true;
}
{
  type Actual = _ParseGroupMeta<"?:">;
  const _: Eq<Actual, [_GroupMeta<GroupKind.NonCapturing>, ""]> = true;
}
{
  type Actual = _ParseGroupMeta<"?!abc">;
  const _: Eq<Actual, [_GroupMeta<GroupKind.NegativeLookahead>, "abc"]> = true;
}
{
  type Actual = _ParseGroupMeta<"?:abc">;
  const _: Eq<Actual, [_GroupMeta<GroupKind.NonCapturing>, "abc"]> = true;
}
{
  type Actual = _ParseGroupMeta<"abc">;
  const _: Eq<Actual, [_GroupMeta<GroupKind.Capturing>, "abc"]> = true;
}
{
  type Actual = _ParseGroupMeta<"?<abc">;
  const _: Eq<Actual, Err<"unterminated group name">> = true;
}
{
  type Actual = _ParseGroupMeta<"?<abc>">;
  const _: Eq<Actual, [_GroupMeta<GroupKind.Capturing, "abc">, ""]> = true;
}

{
  type Actual = _ParseGroup<"">;
  const _: Eq<Actual, Err<"unterminated group">> = true;
}
{
  type Actual = _ParseGroup<")">;
  const _: Eq<Actual, Err<"empty group">> = true;
}
{
  type Actual = _ParseGroup<"abc)">;
  const _: Eq<Actual, [Group<RE<[Prefix<"abc">]>>, ""]> = true;
}
{
  type Actual = _ParseGroup<"abc)def">;
  const _: Eq<Actual, [Group<RE<[Prefix<"abc">]>>, "def"]> = true;
}
{
  type Actual = _ParseGroup<"a\\)b)">;
  const _: Eq<Actual, [Group<RE<[Prefix<"a)b">]>>, ""]> = true;
}
{
  type Actual = _ParseGroup<"a(b)c)d">;
  {
    const _: Eq<
      Actual,
      [
        Group<RE<[Prefix<"a">, Group<RE<[Prefix<"b">]>>, Prefix<"c">], [0]>>,
        "d",
      ]
    > = true;
  }
  {
    const _: Actual[1] = "d";
  }
}
{
  type Actual = _ParseGroup<"?:a)">;
  const _: Eq<
    Actual,
    [Group<RE<[Prefix<"a">]>, "", GroupKind.NonCapturing>, ""]
  > = true;
}

{
  type Actual = _ParseGroup<"a(b))">;
  {
    const _: Actual["length"] = 2;
    const _rest: Actual[1] = "";
    const _keys: Array<keyof Actual[0]> = ["pattern", "kind", "name"];
  }
  {
    const _: Eq<
      Actual[0]["pattern"]["parts"][0],
      Prefix<"a">
      // [Group<RE<[Prefix<"a">, Group<RE<[Prefix<"b">]>>], [0]>>, ""]
    > = true;
  }
  {
    const _: Eq<
      Actual[0]["pattern"]["parts"][1],
      Group<RE<[Prefix<"b">]>>
    > = true;
  }
  {
    const _: Eq<Actual[0]["kind"], GroupKind.Capturing> = true;
  }
  {
    const _: Eq<Actual[0]["name"], ""> = true;
  }
  {
    const _: Eq<Actual[0]["pattern"]["captures"], [0]> = true;
  }
  {
    const _: Eq<Actual[0]["pattern"]["names"], never> = true;
  }
}
