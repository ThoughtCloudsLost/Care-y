/**
* | output |
* | --- |
* | "Notifies {targets}" |
*
* @param {Admin_Note_Types_NotifiesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_notifies: ((inputs: Admin_Note_Types_NotifiesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Note_Types_NotifiesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Note_Types_NotifiesInputs = {
    targets: NonNullable<unknown>;
};
