/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_Day_SundayInputs */

const en_intake_avail_day_sunday = /** @type {(inputs: Intake_Avail_Day_SundayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sunday`)
};

const es_intake_avail_day_sunday = /** @type {(inputs: Intake_Avail_Day_SundayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Domingo`)
};

/**
* | output |
* | --- |
* | "Sunday" |
*
* @param {Intake_Avail_Day_SundayInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_day_sunday = /** @type {((inputs?: Intake_Avail_Day_SundayInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Day_SundayInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_avail_day_sunday(inputs)
	return es_intake_avail_day_sunday(inputs)
});