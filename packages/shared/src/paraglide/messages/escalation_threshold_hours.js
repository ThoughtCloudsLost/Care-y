/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Escalation_Threshold_HoursInputs */

const en_escalation_threshold_hours = /** @type {(inputs: Escalation_Threshold_HoursInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} hours`)
};

const es_escalation_threshold_hours = /** @type {(inputs: Escalation_Threshold_HoursInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} horas`)
};

/**
* | output |
* | --- |
* | "{count} hours" |
*
* @param {Escalation_Threshold_HoursInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_threshold_hours = /** @type {((inputs: Escalation_Threshold_HoursInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Threshold_HoursInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_escalation_threshold_hours(inputs)
	return es_escalation_threshold_hours(inputs)
});