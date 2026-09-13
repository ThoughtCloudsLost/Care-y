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

/**
* | output |
* | --- |
* | "Inactive" |
*
* @param {Intake_Forms_InactiveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_inactive = /** @type {((inputs?: Intake_Forms_InactiveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_InactiveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_inactive(inputs)
	return es_intake_forms_inactive(inputs)
});