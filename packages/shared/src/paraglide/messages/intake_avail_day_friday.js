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

const en_xa2_intake_avail_day_friday = /** @type {(inputs: Intake_Avail_Day_FridayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Frìdày ••⟧`)
};

/**
* | output |
* | --- |
* | "Friday" |
*
* @param {Intake_Avail_Day_FridayInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_avail_day_friday = /** @type {((inputs?: Intake_Avail_Day_FridayInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Day_FridayInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_avail_day_friday(inputs)
	if (locale === "en-XA") return en_xa2_intake_avail_day_friday(inputs)
	return en_intake_avail_day_friday(inputs)
});