/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_Day_SaturdayInputs */

const en_intake_avail_day_saturday = /** @type {(inputs: Intake_Avail_Day_SaturdayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saturday`)
};

const es_intake_avail_day_saturday = /** @type {(inputs: Intake_Avail_Day_SaturdayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sábado`)
};

const en_xa2_intake_avail_day_saturday = /** @type {(inputs: Intake_Avail_Day_SaturdayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàtùrdày •••⟧`)
};

/**
* | output |
* | --- |
* | "Saturday" |
*
* @param {Intake_Avail_Day_SaturdayInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_avail_day_saturday = /** @type {((inputs?: Intake_Avail_Day_SaturdayInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Day_SaturdayInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_avail_day_saturday(inputs)
	if (locale === "en-XA") return en_xa2_intake_avail_day_saturday(inputs)
	return en_intake_avail_day_saturday(inputs)
});