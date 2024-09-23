import { DeriveWRTRegExp } from "../src";
import { Eq } from "../src/utils";

const matchesLetters: Eq<DeriveWRTRegExp<".", "a">, ""> = true;
const matchesNumbers: Eq<DeriveWRTRegExp<".", "0">, ""> = true;
const evenMatchesEmoji: Eq<DeriveWRTRegExp<".", "⭐">, ""> = true;
