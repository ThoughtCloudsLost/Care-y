/**
* | output |
* | --- |
* | "Deleted {deleted} of {total} articles" |
*
* @param {Library_Delete_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_delete_success: ((inputs: Library_Delete_SuccessInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Delete_SuccessInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Delete_SuccessInputs = {
    deleted: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
