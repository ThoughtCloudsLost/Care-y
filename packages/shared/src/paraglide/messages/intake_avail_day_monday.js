/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_Day_MondayInputs */

const en_intake_avail_day_monday = /** @type {(inputs: Intake_Avail_Day_MondayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Monday`)
};

const es_intake_avail_day_monday = /** @type {(inputs: Intake_Avail_Day_MondayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lunes`)
};

/**
* | output |
* | --- |
* | "Monday" |
*
* @param {Intake_Avail_Day_MondayInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_day_monday = /** @type {((inputs?: Intake_Avail_Day_MondayInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Day_MondayInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_avail_day_monday(inputs)
	return es_intake_avail_day_monday(inputs)
});