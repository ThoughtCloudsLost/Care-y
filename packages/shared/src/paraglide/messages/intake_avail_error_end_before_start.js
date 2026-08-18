/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_Error_End_Before_StartInputs */

const en_intake_avail_error_end_before_start = /** @type {(inputs: Intake_Avail_Error_End_Before_StartInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`End time must be after start time.`)
};

const es_intake_avail_error_end_before_start = /** @type {(inputs: Intake_Avail_Error_End_Before_StartInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La hora de fin debe ser posterior a la hora de inicio.`)
};

/**
* | output |
* | --- |
* | "End time must be after start time." |
*
* @param {Intake_Avail_Error_End_Before_StartInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_error_end_before_start = /** @type {((inputs?: Intake_Avail_Error_End_Before_StartInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Error_End_Before_StartInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_avail_error_end_before_start(inputs)
	return es_intake_avail_error_end_before_start(inputs)
});