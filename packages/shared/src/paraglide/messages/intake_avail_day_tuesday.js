/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_Day_TuesdayInputs */

const en_intake_avail_day_tuesday = /** @type {(inputs: Intake_Avail_Day_TuesdayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tuesday`)
};

const es_intake_avail_day_tuesday = /** @type {(inputs: Intake_Avail_Day_TuesdayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Martes`)
};

const en_xa2_intake_avail_day_tuesday = /** @type {(inputs: Intake_Avail_Day_TuesdayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tùèsdày •••⟧`)
};

/**
* | output |
* | --- |
* | "Tuesday" |
*
* @param {Intake_Avail_Day_TuesdayInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_avail_day_tuesday = /** @type {((inputs?: Intake_Avail_Day_TuesdayInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Day_TuesdayInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_avail_day_tuesday(inputs)
	if (locale === "en-XA") return en_xa2_intake_avail_day_tuesday(inputs)
	return en_intake_avail_day_tuesday(inputs)
});