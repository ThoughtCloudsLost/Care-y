/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Add_FieldInputs */

const en_intake_forms_add_field = /** @type {(inputs: Intake_Forms_Add_FieldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add field`)
};

const es_intake_forms_add_field = /** @type {(inputs: Intake_Forms_Add_FieldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar campo`)
};

/**
* | output |
* | --- |
* | "Add field" |
*
* @param {Intake_Forms_Add_FieldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_add_field = /** @type {((inputs?: Intake_Forms_Add_FieldInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Add_FieldInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_add_field(inputs)
	return es_intake_forms_add_field(inputs)
});