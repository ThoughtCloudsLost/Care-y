/**
* | output |
* | --- |
* | "Delete {count} articles? This cannot be undone." |
*
* @param {Library_Delete_Confirm_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_delete_confirm_body: ((inputs: Library_Delete_Confirm_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Delete_Confirm_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Delete_Confirm_BodyInputs = {
    count: NonNullable<unknown>;
};
