/**
* | output |
* | --- |
* | "Deleted {count} articles" |
*
* @param {Library_Delete_All_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_delete_all_success: ((inputs: Library_Delete_All_SuccessInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Delete_All_SuccessInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Delete_All_SuccessInputs = {
    count: NonNullable<unknown>;
};
