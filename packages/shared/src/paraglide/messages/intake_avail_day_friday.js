/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_Day_FridayInputs */

const en_intake_avail_day_friday = /** @type {(inputs: Intake_Avail_Day_FridayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Friday`)
};

const es_intake_avail_day_friday = /** @type {(inputs: Intake_Avail_Day_FridayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Viernes`)
};

/**
* | output |
* | --- |
* | "Friday" |
*
* @param {Intake_Avail_Day_FridayInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_day_friday = /** @type {((inputs?: Intake_Avail_Day_FridayInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Day_FridayInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_avail_day_friday(inputs)
	return es_intake_avail_day_friday(inputs)
});