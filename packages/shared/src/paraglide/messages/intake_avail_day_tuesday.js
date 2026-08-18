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

/**
* | output |
* | --- |
* | "Tuesday" |
*
* @param {Intake_Avail_Day_TuesdayInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_day_tuesday = /** @type {((inputs?: Intake_Avail_Day_TuesdayInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Day_TuesdayInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_avail_day_tuesday(inputs)
	return es_intake_avail_day_tuesday(inputs)
});