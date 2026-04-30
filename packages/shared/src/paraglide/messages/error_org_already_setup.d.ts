/**
* | output |
* | --- |
* | "This organization has already been set up." |
*
* @param {Error_Org_Already_SetupInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_org_already_setup: ((inputs?: Error_Org_Already_SetupInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Org_Already_SetupInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Org_Already_SetupInputs = {};
