/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_End_TimeInputs */

const en_intake_avail_end_time = /** @type {(inputs: Intake_Avail_End_TimeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`End time`)
};

const es_intake_avail_end_time = /** @type {(inputs: Intake_Avail_End_TimeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hora de fin`)
};

const en_xa2_intake_avail_end_time = /** @type {(inputs: Intake_Avail_End_TimeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ènd tìmè •••⟧`)
};

/**
* | output |
* | --- |
* | "End time" |
*
* @param {Intake_Avail_End_TimeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_avail_end_time = /** @type {((inputs?: Intake_Avail_End_TimeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_End_TimeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_avail_end_time(inputs)
	if (locale === "en-XA") return en_xa2_intake_avail_end_time(inputs)
	return en_intake_avail_end_time(inputs)
});