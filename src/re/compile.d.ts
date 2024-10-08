import { _CheckFinite, BuildTuple, Eq, TupleGTE } from "../utils";
import type {
  Prefix,
  Quantifier,
  Plus,
  Star,
  Optional,
  Repeat,
  Err,
  GroupKind,
  RE,
  Group,
  Alternation,
  DotAll,
  CaptureRef,
} from "./ir";
import { Parse as _ParseCharClassLiteral } from "./parse/char_class";
import { _ParseEscape } from "./parse/escape";
import { _ParseGroup, _ParseGroupMeta } from "./parse/group";
import { Parse as _ParseQuantifier } from "./parse/quantifier";

type _ReduceGroup<
  Parts extends readonly [...unknown[]],
  Captures extends readonly [...number[]],
  CaptureNames extends string,
  G extends Group<any, any, any>,
> =
  G extends (
    Group<
      RE<any, infer _captures, infer _capture_names>,
      infer Name,
      infer Kind
    >
  ) ?
    Name extends CaptureNames | _capture_names ?
      {
        error: `duplicate capture name`;
        name: Name;
        names: CaptureNames | _capture_names;
        is_str: Name extends string ? true : false;
        is_null: Name extends null ? true : false;
      }
    : Eq<CaptureNames & _capture_names, never> extends false ?
      {
        error: `duplicate capture name collision`;
        duplicate: CaptureNames & _capture_names;
      }
    : Kind extends GroupKind.Capturing ?
      RE<
        [...Parts, G],
        [...Captures, Captures["length"], ..._captures],
        CaptureNames | _capture_names | (Name extends "" ? never : Name)
      >
    : RE<
        [...Parts, G],
        [...Captures, ..._captures],
        CaptureNames | _capture_names
      >
  : Err<"unreachable: G must be a Group<_>">;

type _Lazy<R extends Repeat<any, any>> = Repeat<
  R["instruction"],
  Quantifier<R["quantifier"]["min"], R["quantifier"]["min"]>
>;

/** meta-type: => RE | Err */
type Reduce<State extends RE<any, any, any> | Err<any>, Instruction> =
  State extends Err<any> ? State
  : Instruction extends Err<any> ? Instruction
  : State extends RE<[], [], never> ?
    Instruction extends Group<any, any> ?
      _ReduceGroup<[], [], never, Instruction>
    : Instruction extends Quantifier<any, any> ?
      Err<"illegal quantifier at start">
    : Instruction extends "|" ? Err<"illegal alternation at start">
    : Instruction extends CaptureRef<any> ? Err<"illegal capture ref at start">
    : RE<[Instruction]>
  : State extends RE<infer Parts, infer Captures, infer CaptureNames> ?
    Parts extends [...infer Old, infer PrevInstruction] ?
      PrevInstruction extends Alternation<infer Branches> ?
        Instruction extends "|" ?
          Err<"empty alternation branch">
        : RE<
            [...Old, Alternation<[...Branches, Instruction]>],
            Captures,
            CaptureNames
          >
      : Instruction extends Prefix<infer P2 extends string> ?
        PrevInstruction extends Prefix<infer P1> ?
          RE<[...Old, Prefix<`${P1}${P2}`>], Captures, CaptureNames>
        : RE<[...Parts, Instruction], Captures, CaptureNames>
      : Instruction extends Group<any, any, any> ?
        _ReduceGroup<Parts, Captures, CaptureNames, Instruction>
      : Instruction extends CaptureRef<infer Index> ?
        TupleGTE<Captures, BuildTuple<Index>> extends true ?
          RE<[...Parts, Instruction], Captures, CaptureNames>
        : Err<"capture ref out of bounds"> & {
            ref: Index;
            max: Captures["length"];
          }
      : Instruction extends Quantifier<any, any> ?
        Parts extends [...infer Prev, infer P] ?
          P extends Repeat<any, any> ?
            Instruction extends Optional ?
              RE<[...Prev, _Lazy<P>], Captures, CaptureNames>
            : { error: "illegal quantifier after quantifier" }
          : RE<[...Prev, Repeat<P, Instruction>], Captures, CaptureNames>
        : Err<"unreachable: Parts should only be empty if State is RE<[], [], {}>">
      : Instruction extends "|" ?
        RE<[...Old, Alternation<[PrevInstruction]>], Captures, CaptureNames>
      : RE<[...Parts, Instruction], Captures, CaptureNames>
    : Err<"unreachable: Parts must have 0 or 1+ elements">
  : Err<"unreachable: State must be RE<[]> | RE<[..]> | Err">;

/** meta-type: string => RE | { error: string } */
export type Compile<
  Src extends string,
  State extends RE<any, any, any> | Err<any> = RE<[], [], never>,
  Stack extends readonly [...string[]] = [],
> =
  _CheckFinite<Src> extends Err<infer E> ? Err<E>
  : Src extends "" ?
    State extends RE<[], any, any> ?
      Stack extends [] ?
        Err<"empty pattern"> & { stack: Stack }
      : Err<"empty group">
    : State
  : Src extends `${infer Next}${infer After}` ?
    Next extends "+" ? Compile<After, Reduce<State, Plus>, Stack>
    : Next extends "*" ? Compile<After, Reduce<State, Star>, Stack>
    : Next extends "?" ? Compile<After, Reduce<State, Optional>, Stack>
    : Next extends "|" ? Compile<After, Reduce<State, "|">, Stack>
    : Next extends "." ? Compile<After, Reduce<State, DotAll>, Stack>
    : Next extends "\\" ?
      _ParseEscape<After> extends (
        [infer Instruction, infer Remainder extends string]
      ) ?
        Compile<Remainder, Reduce<State, Instruction>, Stack>
      : { error: "_ParseEscape panicked" }
    : Next extends "[" ?
      _ParseCharClassLiteral<null, After> extends (
        [infer I, infer Rest extends string]
      ) ?
        Compile<Rest, Reduce<State, I>, Stack>
      : { error: "_ParseCharClassLiteral panicked" }
    : Next extends "{" ?
      _ParseQuantifier<null, After> extends (
        [infer I, infer Rest extends string]
      ) ?
        Compile<Rest, Reduce<State, I>, Stack>
      : _ParseQuantifier<null, After> // err
    : Next extends ")" ?
      Stack extends [] ?
        Err<"unmatched closing parenthesis"> & { state: State; stack: Stack }
      : State extends RE<[], any, any> ? Err<"empty group">
      : [State, After] // this closes a group!
    : Next extends "(" ?
      _ParseGroup<After> extends [infer I, infer Rest extends string] ?
        Compile<Rest, Reduce<State, I>, Stack>
      : { error: "_ParseGroup panicked" } & { __result: _ParseGroup<After> }
    : Compile<After, Reduce<State, Prefix<Next>>, Stack>
  : Err<"n ever">;
