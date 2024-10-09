import { _Match, _Exec } from ".";
import { _CheckFinite } from "../../../utils";
import { Err } from "../../ir";

export type _ExecAlt<
  Branches extends readonly [...unknown[]],
  Str extends string,
  Captures extends readonly [...string[]],
> =
  _CheckFinite<Str> extends Err<infer E> ? Err<E>
  : Branches extends [] ? Err<"no branches match">
  : Branches extends [infer Head, ...infer Tail] ?
    _Exec<Head, Str, Captures> extends infer Result ?
      Result extends Err<any> ? _ExecAlt<Tail, Str, Captures>
      : Result extends _Match<any, any> ? Result
      : Err<"unreachable: _Exec must return _Match | _REMatch | Err">
    : Err<"unreachable: _Exec must return _Match | _REMatch | Err">
  : Err<"unreachable: Branches must have 0 or 1+ elements.">;
