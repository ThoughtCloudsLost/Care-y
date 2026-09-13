/**
* | output |
* | --- |
* | "Review content" |
*
* @param {Permission_Moderate_ContentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_moderate_content: ((inputs?: Permission_Moderate_ContentInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Moderate_ContentInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Moderate_ContentInputs = {};
