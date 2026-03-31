/**
* | output |
* | --- |
* | "This volunteer can no longer access new tickets. They have already seen decrypted content for tickets they were previously assigned to. That access cannot be..." |
*
* @param {Exposure_Hint_Remove_VolunteerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const exposure_hint_remove_volunteer: ((inputs?: Exposure_Hint_Remove_VolunteerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Exposure_Hint_Remove_VolunteerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Exposure_Hint_Remove_VolunteerInputs = {};
