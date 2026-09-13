/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Field_Type_Rich_TextInputs */

const en_intake_forms_field_type_rich_text = /** @type {(inputs: Intake_Forms_Field_Type_Rich_TextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Text block`)
};

const es_intake_forms_field_type_rich_text = /** @type {(inputs: Intake_Forms_Field_Type_Rich_TextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bloque de texto`)
};

/**
* | output |
* | --- |
* | "Text block" |
*
* @param {Intake_Forms_Field_Type_Rich_TextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_rich_text = /** @type {((inputs?: Intake_Forms_Field_Type_Rich_TextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Field_Type_Rich_TextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_field_type_rich_text(inputs)
	return es_intake_forms_field_type_rich_text(inputs)
});