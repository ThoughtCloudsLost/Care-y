/**
* | output |
* | --- |
* | "An account with this login username already exists." |
*
* @param {Error_Account_Already_ExistsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_account_already_exists: ((inputs?: Error_Account_Already_ExistsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Account_Already_ExistsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Account_Already_ExistsInputs = {};
