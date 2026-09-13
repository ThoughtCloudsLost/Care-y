/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_Error_Past_DateInputs */

const en_intake_avail_error_past_date = /** @type {(inputs: Intake_Avail_Error_Past_DateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Date cannot be in the past.`)
};

const es_intake_avail_error_past_date = /** @type {(inputs: Intake_Avail_Error_Past_DateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La fecha no puede ser en el pasado.`)
};

/**
* | output |
* | --- |
* | "Date cannot be in the past." |
*
* @param {Intake_Avail_Error_Past_DateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_error_past_date = /** @type {((inputs?: Intake_Avail_Error_Past_DateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Error_Past_DateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_avail_error_past_date(inputs)
	return es_intake_avail_error_past_date(inputs)
});