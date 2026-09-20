/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown>, max: NonNullable<unknown> }} Intake_Avail_Specific_CountInputs */

const en_intake_avail_specific_count = /** @type {(inputs: Intake_Avail_Specific_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} of ${i?.max}`)
};

const es_intake_avail_specific_count = /** @type {(inputs: Intake_Avail_Specific_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} de ${i?.max}`)
};

const en_xa2_intake_avail_specific_count = /** @type {(inputs: Intake_Avail_Specific_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} òf  ••${i?.max}⟧`)
};

/**
* | output |
* | --- |
* | "{count} of {max}" |
*
* @param {Intake_Avail_Specific_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_avail_specific_count = /** @type {((inputs: Intake_Avail_Specific_CountInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Specific_CountInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_avail_specific_count(inputs)
	if (locale === "en-XA") return en_xa2_intake_avail_specific_count(inputs)
	return en_intake_avail_specific_count(inputs)
});