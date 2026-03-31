/**
* | output |
* | --- |
* | "This person will be able to read decrypted client data for any ticket they are assigned to. That data covers names, phone numbers, messages, and case notes. ..." |
*
* @param {Exposure_Hint_Add_VolunteerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const exposure_hint_add_volunteer: ((inputs?: Exposure_Hint_Add_VolunteerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Exposure_Hint_Add_VolunteerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Exposure_Hint_Add_VolunteerInputs = {};
