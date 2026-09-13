/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_Specific_TitleInputs */

const en_intake_avail_specific_title = /** @type {(inputs: Intake_Avail_Specific_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Specific dates`)
};

const es_intake_avail_specific_title = /** @type {(inputs: Intake_Avail_Specific_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fechas especificas`)
};

/**
* | output |
* | --- |
* | "Specific dates" |
*
* @param {Intake_Avail_Specific_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_specific_title = /** @type {((inputs?: Intake_Avail_Specific_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Specific_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_avail_specific_title(inputs)
	return es_intake_avail_specific_title(inputs)
});