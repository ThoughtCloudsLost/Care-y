/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_Threshold_Too_LowInputs */

const en_escalation_threshold_too_low = /** @type {(inputs: Escalation_Threshold_Too_LowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Threshold must be at least 5 minutes.`)
};

const es_escalation_threshold_too_low = /** @type {(inputs: Escalation_Threshold_Too_LowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El umbral debe ser de al menos 5 minutos.`)
};

/**
* | output |
* | --- |
* | "Threshold must be at least 5 minutes." |
*
* @param {Escalation_Threshold_Too_LowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_threshold_too_low = /** @type {((inputs?: Escalation_Threshold_Too_LowInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Threshold_Too_LowInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_escalation_threshold_too_low(inputs)
	return es_escalation_threshold_too_low(inputs)
});