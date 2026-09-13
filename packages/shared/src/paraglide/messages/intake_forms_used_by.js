/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Used_ByInputs */

const en_intake_forms_used_by = /** @type {(inputs: Intake_Forms_Used_ByInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Used by`)
};

const es_intake_forms_used_by = /** @type {(inputs: Intake_Forms_Used_ByInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usado por`)
};

/**
* | output |
* | --- |
* | "Used by" |
*
* @param {Intake_Forms_Used_ByInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_used_by = /** @type {((inputs?: Intake_Forms_Used_ByInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Used_ByInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_used_by(inputs)
	return es_intake_forms_used_by(inputs)
});