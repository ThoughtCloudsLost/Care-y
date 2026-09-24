/**
* | output |
* | --- |
* | "Cannot remove your last verification method. At least one must remain active." |
*
* @param {Error_Cannot_Remove_Last_2faInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_cannot_remove_last_2fa: ((inputs?: Error_Cannot_Remove_Last_2faInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Cannot_Remove_Last_2faInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Cannot_Remove_Last_2faInputs = {};
