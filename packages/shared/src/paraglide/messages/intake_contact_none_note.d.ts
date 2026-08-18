/**
* | output |
* | --- |
* | "The organization will not be able to reach out to you." |
*
* @param {Intake_Contact_None_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_contact_none_note: ((inputs?: Intake_Contact_None_NoteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Contact_None_NoteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Contact_None_NoteInputs = {};
