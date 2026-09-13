/**
* | output |
* | --- |
* | "Call preference saved" |
*
* @param {Consultant_Phone_Preference_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_preference_saved: ((inputs?: Consultant_Phone_Preference_SavedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_Preference_SavedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_Preference_SavedInputs = {};
