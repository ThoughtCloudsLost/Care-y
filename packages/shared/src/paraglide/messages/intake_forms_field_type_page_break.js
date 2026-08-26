/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Field_Type_Page_BreakInputs */

const en_intake_forms_field_type_page_break = /** @type {(inputs: Intake_Forms_Field_Type_Page_BreakInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Page break`)
};

const es_intake_forms_field_type_page_break = /** @type {(inputs: Intake_Forms_Field_Type_Page_BreakInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Salto de pagina`)
};

/**
* | output |
* | --- |
* | "Page break" |
*
* @param {Intake_Forms_Field_Type_Page_BreakInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_page_break = /** @type {((inputs?: Intake_Forms_Field_Type_Page_BreakInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Type_Page_BreakInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_field_type_page_break(inputs)
	return es_intake_forms_field_type_page_break(inputs)
});