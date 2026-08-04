/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Escalation_Threshold_DaysInputs */

const en_escalation_threshold_days = /** @type {(inputs: Escalation_Threshold_DaysInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} days`)
};

const es_escalation_threshold_days = /** @type {(inputs: Escalation_Threshold_DaysInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} días`)
};

/**
* | output |
* | --- |
* | "{count} days" |
*
* @param {Escalation_Threshold_DaysInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_threshold_days = /** @type {((inputs: Escalation_Threshold_DaysInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Threshold_DaysInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_escalation_threshold_days(inputs)
	return es_escalation_threshold_days(inputs)
});