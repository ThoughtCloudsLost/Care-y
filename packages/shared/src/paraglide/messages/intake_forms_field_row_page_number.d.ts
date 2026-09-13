/**
* | output |
* | --- |
* | "Page {page}" |
*
* @param {Intake_Forms_Field_Row_Page_NumberInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_page_number: ((inputs: Intake_Forms_Field_Row_Page_NumberInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_Row_Page_NumberInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_Row_Page_NumberInputs = {
    page: NonNullable<unknown>;
};
