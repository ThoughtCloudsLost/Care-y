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

const en_xa2_escalation_threshold_too_low = /** @type {(inputs: Escalation_Threshold_Too_LowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thrèshòld mùst bè àt lèàst 5 mìnùtès. ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Threshold must be at least 5 minutes." |
*
* @param {Escalation_Threshold_Too_LowInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_threshold_too_low = /** @type {((inputs?: Escalation_Threshold_Too_LowInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Threshold_Too_LowInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_escalation_threshold_too_low(inputs)
	if (locale === "en-XA") return en_xa2_escalation_threshold_too_low(inputs)
	return en_escalation_threshold_too_low(inputs)
});