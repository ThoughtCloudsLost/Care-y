/**
* | output |
* | --- |
* | "Deleted {count} articles" |
*
* @param {Library_Delete_All_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_delete_all_success: ((inputs: Library_Delete_All_SuccessInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Delete_All_SuccessInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Delete_All_SuccessInputs = {
    count: NonNullable<unknown>;
};
