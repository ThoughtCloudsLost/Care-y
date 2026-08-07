/**
* | output |
* | --- |
* | "Enabling SMS pings again requires re-verification because the server no longer has your number." |
*
* @param {Consultant_Phone_Reverify_ExplainerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_reverify_explainer: ((inputs?: Consultant_Phone_Reverify_ExplainerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_Reverify_ExplainerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_Reverify_ExplainerInputs = {};
