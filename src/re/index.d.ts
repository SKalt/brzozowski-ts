import { Compile } from "./compile";
import { Err, RE } from "./ir";
import { Exec, REMatch } from "./match";

export type { Compile } from "./compile";
export type { Exec, REMatch } from "./match";

export type RecognizePrefix<
  Expr extends string | RE<any, any, any>,
  Str extends string,
> =
  Expr extends string ?
    Compile<Expr> extends infer Compiled ?
      Compiled extends Err<any> ? Compiled
      : Compiled extends RE<any, any, any> ? RecognizePrefix<Compiled, Str>
      : Err<"unreachable: Compile must return Err | RE">
    : Err<"unreachable: infallible infer">
  : Expr extends RE<any, any, any> ?
    Exec<Expr, Str> extends infer Result ?
      Result extends Err<any> ? Result
      : Result extends REMatch<any, any, any, any> ? Result
      : Err<"unreachable: Exec must return REMatch | Err"> & { result: Result }
    : Err<"unreachable: infallible infer">
  : Err<"unreachable: Expr must be string | RE"> & { expr: Expr };

export type Recognize<
  Expr extends string | RE<any, any, any>,
  Str extends string,
> =
  RecognizePrefix<Expr, Str> extends infer Result ?
    Result extends Err<any> ? Result
    : Result extends REMatch<infer Matched, infer Rest, any, any> ?
      Rest extends "" ?
        Str // watch out! Returning `Rest` messes up const inference
      : Err<"string does not match pattern"> & { str: Str; rest: Rest }
    : Err<"unreachable: RecognizePrefix must return REMatch | Err">
  : never;
