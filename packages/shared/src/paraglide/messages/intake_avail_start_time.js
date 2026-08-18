/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_Start_TimeInputs */

const en_intake_avail_start_time = /** @type {(inputs: Intake_Avail_Start_TimeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Start time`)
};

const es_intake_avail_start_time = /** @type {(inputs: Intake_Avail_Start_TimeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hora de inicio`)
};

/**
* | output |
* | --- |
* | "Start time" |
*
* @param {Intake_Avail_Start_TimeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_start_time = /** @type {((inputs?: Intake_Avail_Start_TimeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Start_TimeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_avail_start_time(inputs)
	return es_intake_avail_start_time(inputs)
});