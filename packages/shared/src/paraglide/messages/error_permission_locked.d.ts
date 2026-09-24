/**
* | output |
* | --- |
* | "This permission is protected and cannot be changed." |
*
* @param {Error_Permission_LockedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_permission_locked: ((inputs?: Error_Permission_LockedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Permission_LockedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Permission_LockedInputs = {};
