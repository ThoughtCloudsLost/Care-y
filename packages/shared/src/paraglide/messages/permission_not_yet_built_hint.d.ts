/**
* | output |
* | --- |
* | "Four of these have nothing behind them yet: Link cases together, Set who is notified about a queue, Manage saved replies, and Delete client records. They are..." |
*
* @param {Permission_Not_Yet_Built_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_not_yet_built_hint: ((inputs?: Permission_Not_Yet_Built_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Not_Yet_Built_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Not_Yet_Built_HintInputs = {};
