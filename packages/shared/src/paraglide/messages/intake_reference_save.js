/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Reference_SaveInputs */

const en_intake_reference_save = /** @type {(inputs: Intake_Reference_SaveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save it if you want to follow up by phone.`)
};

const es_intake_reference_save = /** @type {(inputs: Intake_Reference_SaveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardalo por si quieres dar seguimiento por telefono.`)
};

/**
* | output |
* | --- |
* | "Save it if you want to follow up by phone." |
*
* @param {Intake_Reference_SaveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_reference_save = /** @type {((inputs?: Intake_Reference_SaveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Reference_SaveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_reference_save(inputs)
	return es_intake_reference_save(inputs)
});