/**
* | output |
* | --- |
* | "An account with this login username already exists." |
*
* @param {Error_Account_Already_ExistsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_account_already_exists: ((inputs?: Error_Account_Already_ExistsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Account_Already_ExistsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Account_Already_ExistsInputs = {};
