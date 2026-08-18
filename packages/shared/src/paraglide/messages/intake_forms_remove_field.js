/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Remove_FieldInputs */

const en_intake_forms_remove_field = /** @type {(inputs: Intake_Forms_Remove_FieldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove field`)
};

const es_intake_forms_remove_field = /** @type {(inputs: Intake_Forms_Remove_FieldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Quitar campo`)
};

/**
* | output |
* | --- |
* | "Remove field" |
*
* @param {Intake_Forms_Remove_FieldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_remove_field = /** @type {((inputs?: Intake_Forms_Remove_FieldInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Remove_FieldInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_remove_field(inputs)
	return es_intake_forms_remove_field(inputs)
});