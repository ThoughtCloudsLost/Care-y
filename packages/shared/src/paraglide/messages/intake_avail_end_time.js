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

/**
* | output |
* | --- |
* | "End time" |
*
* @param {Intake_Avail_End_TimeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_end_time = /** @type {((inputs?: Intake_Avail_End_TimeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_End_TimeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_avail_end_time(inputs)
	return es_intake_avail_end_time(inputs)
});