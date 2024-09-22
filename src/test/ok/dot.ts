import { AnyChar, DerivePattern } from "../..";
import { Eq } from "../../utils";

const matchesLetters: Eq<DerivePattern<".", "a">, ""> = true;
const matchesNumbers: Eq<DerivePattern<".", "0">, ""> = true;
const evenMatchesEmoji: Eq<DerivePattern<".", "⭐">, ""> = true;
