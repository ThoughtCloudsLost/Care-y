/**
* | output |
* | --- |
* | "Secondary {client} is already merged." |
*
* @param {Error_Secondary_Already_MergedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_secondary_already_merged: ((inputs: Error_Secondary_Already_MergedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Secondary_Already_MergedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Secondary_Already_MergedInputs = {
    client: NonNullable<unknown>;
};
