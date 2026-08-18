/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_Time_ToInputs */

const en_intake_avail_time_to = /** @type {(inputs: Intake_Avail_Time_ToInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`to`)
};

const es_intake_avail_time_to = /** @type {(inputs: Intake_Avail_Time_ToInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`a`)
};

/**
* | output |
* | --- |
* | "to" |
*
* @param {Intake_Avail_Time_ToInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_time_to = /** @type {((inputs?: Intake_Avail_Time_ToInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Time_ToInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_avail_time_to(inputs)
	return es_intake_avail_time_to(inputs)
});