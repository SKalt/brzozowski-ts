import { REMatch } from ".";
import { Exec } from "..";
import { Err, GroupKind, RE } from "../../ir";

export type _ExecGroup<
  Pattern extends RE<any, any, any>,
  Kind extends GroupKind,
  Captures extends readonly [...string[]],
  // NamedCaptures get joined with the parent's namedCaptures, so passing them down is unnecessary
  Str extends string,
> =
  Kind extends GroupKind.Capturing ?
    Exec<Pattern, Str, [], Captures> extends infer M ?
      M extends Err<any> ? M
      : M extends REMatch<any, any, any, any> ?
        Kind extends GroupKind.Capturing ?
          M["captures"] extends (
            [...Captures, ...infer SubCaptures extends string[]]
          ) ?
            REMatch<
              M["matched"],
              M["rest"],
              [...Captures, M["matched"], ...SubCaptures],
              M["groups"]
            >
          : Err<"unreachable: if M is a capturing group, captures must have at least 1 element">
        : M
      : Err<"unreachable: Exec<_> must return _REmatch | Err">
    : Err<"unreachable: infallible infer">
  : Err<"unsupported group kind"> & { kind: Kind };
