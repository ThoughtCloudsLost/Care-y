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

const en_xa2_intake_forms_remove_field = /** @type {(inputs: Intake_Forms_Remove_FieldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèmòvè fìèld ••••⟧`)
};

/**
* | output |
* | --- |
* | "Remove field" |
*
* @param {Intake_Forms_Remove_FieldInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_remove_field = /** @type {((inputs?: Intake_Forms_Remove_FieldInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Remove_FieldInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_remove_field(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_remove_field(inputs)
	return en_intake_forms_remove_field(inputs)
});