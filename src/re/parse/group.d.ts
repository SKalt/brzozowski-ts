import { Err, Group, GroupKind, RE } from "../ir";
import { Compile } from "../compile";

export type _GroupMeta<Kind extends GroupKind, Name extends string = ""> = {
  kind: Kind;
  name: Name;
};
/** meta-type: => [{kind: GroupType, name: string | null}, string] */
export type _ParseGroupMeta<Str extends string> =
  Str extends `${infer Next}${infer Rest}` ?
    Next extends "?" ?
      Rest extends `${infer Next}${infer Rest}` ?
        Next extends ":" ? [_GroupMeta<GroupKind.NonCapturing>, Rest]
        : Next extends `=` ? [_GroupMeta<GroupKind.PositiveLookahead>, Rest]
        : Next extends `!` ? [_GroupMeta<GroupKind.NegativeLookahead>, Rest]
        : Next extends `<` ?
          Rest extends `${infer Next}${infer Rest2}` ?
            Next extends "=" ? [_GroupMeta<GroupKind.PositiveLookbehind>, Rest2]
            : Next extends `!` ?
              [_GroupMeta<GroupKind.NegativeLookbehind>, Rest2]
            : Rest extends `${infer Name extends string}>${infer Rest}` ?
              [_GroupMeta<GroupKind.Capturing, Name>, Rest]
            : Err<"unterminated group name">
          : Err<"unterminated group metadata"> & { prefix: "?<" }
        : Err<"unterminated group metadata"> & { prefix: "?" }
      : [_GroupMeta<GroupKind.Capturing>, Str]
    : [_GroupMeta<GroupKind.Capturing>, Str]
  : Err<"unterminated group">;

/** meta-type: => [Group | Err, string] | Err */
export type _ParseGroup<
  Str extends string,
  State extends null | Group<any, any, any> = null,
  Stack extends readonly [...string[]] = ["("],
> =
  Str extends "" ? Err<"unterminated group">
  : State extends null ?
    _ParseGroupMeta<Str> extends infer M ?
      M extends Err<any> ? M
      : M extends (
        [_GroupMeta<infer Kind, infer Name>, infer Rest extends string]
      ) ?
        _ParseGroup<Rest, Group<RE<[]>, Name, Kind>, Stack>
      : Err<"unreachable: _ParseGroupMeta must result in either [_, string] | Err">
    : Err<"unreachable: infallible infer">
  : State extends Group<infer Pattern, infer Name, infer Kind> ?
    Compile<Str, Pattern, Stack> extends infer M ?
      M extends Err<any> ? M
      : M extends [infer S, infer Rest extends string] ?
        S extends RE<any, any, any> ?
          [Group<S, Name, Kind>, Rest]
        : Err<"unreachable: Compile[0] must be a RE"> & {
            s: S;
            m: M;
            state: State;
            str: Str;
          }
      : Err<"unreachable: Compile must result in either [_, string] | Err"> & {
          m: M;
        }
    : Err<"unreachable: infallible infer">
  : Err<"unreachable: State must be null | Group<_>"> & {
      str: Str;
      state: State;
      stack: Stack;
    };
