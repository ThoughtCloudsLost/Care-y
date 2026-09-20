/**
* | output |
* | --- |
* | "This organization has already been set up." |
*
* @param {Error_Org_Already_SetupInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_org_already_setup: ((inputs?: Error_Org_Already_SetupInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Org_Already_SetupInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Org_Already_SetupInputs = {};
