/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Duplicate_SuffixInputs */

const en_intake_forms_duplicate_suffix = /** @type {(inputs: Intake_Forms_Duplicate_SuffixInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`(copy)`)
};

const es_intake_forms_duplicate_suffix = /** @type {(inputs: Intake_Forms_Duplicate_SuffixInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`(copia)`)
};

/**
* | output |
* | --- |
* | "(copy)" |
*
* @param {Intake_Forms_Duplicate_SuffixInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_duplicate_suffix = /** @type {((inputs?: Intake_Forms_Duplicate_SuffixInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Duplicate_SuffixInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_duplicate_suffix(inputs)
	return es_intake_forms_duplicate_suffix(inputs)
});