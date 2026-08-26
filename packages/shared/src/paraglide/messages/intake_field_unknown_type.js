/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Field_Unknown_TypeInputs */

const en_intake_field_unknown_type = /** @type {(inputs: Intake_Field_Unknown_TypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This field type is not supported by your version of the form.`)
};

const es_intake_field_unknown_type = /** @type {(inputs: Intake_Field_Unknown_TypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este tipo de campo no es compatible con su version del formulario.`)
};

/**
* | output |
* | --- |
* | "This field type is not supported by your version of the form." |
*
* @param {Intake_Field_Unknown_TypeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_field_unknown_type = /** @type {((inputs?: Intake_Field_Unknown_TypeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Field_Unknown_TypeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_field_unknown_type(inputs)
	return es_intake_field_unknown_type(inputs)
});