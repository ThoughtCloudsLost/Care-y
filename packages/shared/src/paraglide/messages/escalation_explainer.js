/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_ExplainerInputs */

const en_escalation_explainer = /** @type {(inputs: Escalation_ExplainerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alerts notify people; the priority ladder above changes the case itself.`)
};

const es_escalation_explainer = /** @type {(inputs: Escalation_ExplainerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las alertas notifican a las personas; la escala de prioridad de arriba cambia el caso en sí.`)
};

/**
* | output |
* | --- |
* | "Alerts notify people; the priority ladder above changes the case itself." |
*
* @param {Escalation_ExplainerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_explainer = /** @type {((inputs?: Escalation_ExplainerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_ExplainerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_escalation_explainer(inputs)
	return es_escalation_explainer(inputs)
});