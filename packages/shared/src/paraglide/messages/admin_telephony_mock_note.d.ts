/**
* | output |
* | --- |
* | "This organization uses a simulated phone provider. No real calls or messages are sent or received." |
*
* @param {Admin_Telephony_Mock_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_mock_note: ((inputs?: Admin_Telephony_Mock_NoteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Mock_NoteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Mock_NoteInputs = {};
