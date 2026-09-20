/**
* | output |
* | --- |
* | "View own shifts has nothing behind it yet. It is listed so its name stays settled, but granting it changes nothing until shift scheduling is built." |
*
* @param {Permission_Not_Yet_Built_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_not_yet_built_hint: ((inputs?: Permission_Not_Yet_Built_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Not_Yet_Built_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Not_Yet_Built_HintInputs = {};
