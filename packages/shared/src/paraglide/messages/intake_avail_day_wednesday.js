/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_Day_WednesdayInputs */

const en_intake_avail_day_wednesday = /** @type {(inputs: Intake_Avail_Day_WednesdayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Wednesday`)
};

const es_intake_avail_day_wednesday = /** @type {(inputs: Intake_Avail_Day_WednesdayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Miercoles`)
};

/**
* | output |
* | --- |
* | "Wednesday" |
*
* @param {Intake_Avail_Day_WednesdayInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_day_wednesday = /** @type {((inputs?: Intake_Avail_Day_WednesdayInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Day_WednesdayInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_avail_day_wednesday(inputs)
	return es_intake_avail_day_wednesday(inputs)
});