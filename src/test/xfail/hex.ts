import { mustBeHex } from "../ok/hex";

mustBeHex("abz");
mustBeHex("abz" as string);
