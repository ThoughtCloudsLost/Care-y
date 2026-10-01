/**
* | output |
* | --- |
* | "This deletion request can no longer be cancelled." |
*
* @param {Error_Deletion_Not_CancellableInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_deletion_not_cancellable: ((inputs?: Error_Deletion_Not_CancellableInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Deletion_Not_CancellableInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Deletion_Not_CancellableInputs = {};
