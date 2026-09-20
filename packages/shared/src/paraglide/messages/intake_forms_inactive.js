/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_InactiveInputs */

const en_intake_forms_inactive = /** @type {(inputs: Intake_Forms_InactiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Inactive`)
};

const es_intake_forms_inactive = /** @type {(inputs: Intake_Forms_InactiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Inactivo`)
};

const en_xa2_intake_forms_inactive = /** @type {(inputs: Intake_Forms_InactiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìnàctìvè •••⟧`)
};

/**
* | output |
* | --- |
* | "Inactive" |
*
* @param {Intake_Forms_InactiveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_inactive = /** @type {((inputs?: Intake_Forms_InactiveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_InactiveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_inactive(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_inactive(inputs)
	return en_intake_forms_inactive(inputs)
});