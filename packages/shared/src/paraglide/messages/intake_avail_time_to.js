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

const en_xa2_intake_avail_time_to = /** @type {(inputs: Intake_Avail_Time_ToInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦tò •⟧`)
};

/**
* | output |
* | --- |
* | "to" |
*
* @param {Intake_Avail_Time_ToInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_avail_time_to = /** @type {((inputs?: Intake_Avail_Time_ToInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Time_ToInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_avail_time_to(inputs)
	if (locale === "en-XA") return en_xa2_intake_avail_time_to(inputs)
	return en_intake_avail_time_to(inputs)
});