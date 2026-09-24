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

const en_xa2_intake_avail_start_time = /** @type {(inputs: Intake_Avail_Start_TimeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Stàrt tìmè •••⟧`)
};

/**
* | output |
* | --- |
* | "Start time" |
*
* @param {Intake_Avail_Start_TimeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_avail_start_time = /** @type {((inputs?: Intake_Avail_Start_TimeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Start_TimeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_avail_start_time(inputs)
	if (locale === "en-XA") return en_xa2_intake_avail_start_time(inputs)
	return en_intake_avail_start_time(inputs)
});