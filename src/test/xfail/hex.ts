import { mustBeHex } from "../ok/hex";

mustBeHex("abz"); // xfail
mustBeHex("abz" as string); // xfail
