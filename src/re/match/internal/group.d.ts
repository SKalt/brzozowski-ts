import { _REMatch } from ".";
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
      : M extends _REMatch<any, any, any, any> ?
        Kind extends GroupKind.Capturing ?
          M["captures"] extends (
            [...Captures, ...infer SubCaptures extends string[]]
          ) ?
            _REMatch<
              M["matched"],
              M["rest"],
              [...Captures, M["matched"], ...SubCaptures],
              M["namedCaptures"]
            >
          : never
        : M
      : Err<"unreachable: Exec<_> must return _REmatch | Err">
    : never
  : Err<"unsupported group kind"> & { kind: Kind };
