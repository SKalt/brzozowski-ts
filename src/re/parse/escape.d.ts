import { Digit, Whitespace, Word } from "../../char";
import { CaptureRef, Union as CharUnion, Prefix } from "../ir";
/** meta-type: string => [IR, string] | { error: string } */
export type _ParseEscape<Str extends string> =
  Str extends `${infer Char}${infer Rest}` ?
    Char extends "d" ? [CharUnion<Digit, never>, Rest]
    : Char extends "w" ? [CharUnion<Word, never>, Rest]
    : Char extends "s" ? [CharUnion<Whitespace, never>, Rest]
    : Char extends "D" ? [CharUnion<never, Digit>, Rest]
    : Char extends "W" ? [CharUnion<never, Word>, Rest]
    : Char extends "S" ? [CharUnion<never, Whitespace>, Rest]
    : Char extends "n" ? [Prefix<"\n">, Rest]
    : Char extends "t" ? [Prefix<"\t">, Rest]
    : Char extends "r" ? [Prefix<"\r">, Rest]
    : Char extends "f" ? [Prefix<"\f">, Rest]
    : Char extends "v" ? [Prefix<"\v">, Rest]
    : Char extends "0" ? [Prefix<"\0">, Rest]
    : Str extends `${infer Ref extends number}${infer Rest}` ?
      [CaptureRef<Ref>, Rest]
    : [Prefix<Char>, Rest]
  : [{ error: `empty escape sequence: ${Str}` }, Str];
