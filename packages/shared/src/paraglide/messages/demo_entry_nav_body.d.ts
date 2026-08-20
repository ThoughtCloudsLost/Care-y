/**
* | output |
* | --- |
* | "The section tabs at the top of the page jump to a feature, and the simulator opens that screen. Tapping around inside the simulator works in the other direct..." |
*
* @param {Demo_Entry_Nav_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_nav_body: ((inputs?: Demo_Entry_Nav_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Entry_Nav_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Entry_Nav_BodyInputs = {};
