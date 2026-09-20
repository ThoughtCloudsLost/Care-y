/**
* | output |
* | --- |
* | "Page {page}" |
*
* @param {Intake_Forms_Field_Row_Page_NumberInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_page_number: ((inputs: Intake_Forms_Field_Row_Page_NumberInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_Row_Page_NumberInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_Row_Page_NumberInputs = {
    page: NonNullable<unknown>;
};
