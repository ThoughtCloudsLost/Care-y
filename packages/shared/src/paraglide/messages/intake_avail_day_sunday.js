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

const en_xa2_intake_avail_day_sunday = /** @type {(inputs: Intake_Avail_Day_SundayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sùndày ••⟧`)
};

/**
* | output |
* | --- |
* | "Sunday" |
*
* @param {Intake_Avail_Day_SundayInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_avail_day_sunday = /** @type {((inputs?: Intake_Avail_Day_SundayInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Day_SundayInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_avail_day_sunday(inputs)
	if (locale === "en-XA") return en_xa2_intake_avail_day_sunday(inputs)
	return en_intake_avail_day_sunday(inputs)
});