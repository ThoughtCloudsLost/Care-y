/**
* | output |
* | --- |
* | "This user is the sole key holder for one or more tickets. Deactivating would permanently destroy access to that data." |
*
* @param {Error_Sole_Wrap_HolderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_sole_wrap_holder: ((inputs?: Error_Sole_Wrap_HolderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Sole_Wrap_HolderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Sole_Wrap_HolderInputs = {};
