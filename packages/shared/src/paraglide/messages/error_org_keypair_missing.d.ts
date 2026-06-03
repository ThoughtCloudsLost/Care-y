/**
* | output |
* | --- |
* | "Organization setup is incomplete. Please restart the setup process." |
*
* @param {Error_Org_Keypair_MissingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_org_keypair_missing: ((inputs?: Error_Org_Keypair_MissingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Org_Keypair_MissingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Org_Keypair_MissingInputs = {};
