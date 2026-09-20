/**
* | output |
* | --- |
* | "Could not generate a unique {client} alias. Please try again." |
*
* @param {Error_Alias_Generation_FailedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_alias_generation_failed: ((inputs: Error_Alias_Generation_FailedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Alias_Generation_FailedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Alias_Generation_FailedInputs = {
    client: NonNullable<unknown>;
};
