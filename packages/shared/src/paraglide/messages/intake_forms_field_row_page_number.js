/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ page: NonNullable<unknown> }} Intake_Forms_Field_Row_Page_NumberInputs */

const en_intake_forms_field_row_page_number = /** @type {(inputs: Intake_Forms_Field_Row_Page_NumberInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Page ${i?.page}`)
};

const es_intake_forms_field_row_page_number = /** @type {(inputs: Intake_Forms_Field_Row_Page_NumberInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Página ${i?.page}`)
};

const en_xa2_intake_forms_field_row_page_number = /** @type {(inputs: Intake_Forms_Field_Row_Page_NumberInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Pàgè  ••${i?.page}⟧`)
};

/**
* | output |
* | --- |
* | "Page {page}" |
*
* @param {Intake_Forms_Field_Row_Page_NumberInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_page_number = /** @type {((inputs: Intake_Forms_Field_Row_Page_NumberInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Row_Page_NumberInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_field_row_page_number(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_field_row_page_number(inputs)
	return en_intake_forms_field_row_page_number(inputs)
});