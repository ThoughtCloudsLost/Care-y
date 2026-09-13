/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_Day_ThursdayInputs */

const en_intake_avail_day_thursday = /** @type {(inputs: Intake_Avail_Day_ThursdayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Thursday`)
};

const es_intake_avail_day_thursday = /** @type {(inputs: Intake_Avail_Day_ThursdayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Jueves`)
};

/**
* | output |
* | --- |
* | "Thursday" |
*
* @param {Intake_Avail_Day_ThursdayInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_day_thursday = /** @type {((inputs?: Intake_Avail_Day_ThursdayInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Day_ThursdayInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_avail_day_thursday(inputs)
	return es_intake_avail_day_thursday(inputs)
});