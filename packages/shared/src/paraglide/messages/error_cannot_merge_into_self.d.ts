/**
* | output |
* | --- |
* | "Cannot merge a client into itself." |
*
* @param {Error_Cannot_Merge_Into_SelfInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_cannot_merge_into_self: ((inputs?: Error_Cannot_Merge_Into_SelfInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Cannot_Merge_Into_SelfInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Cannot_Merge_Into_SelfInputs = {};
