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

const en_xa2_escalation_explainer = /** @type {(inputs: Escalation_ExplainerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àlèrts nòtìfy pèòplè; thè prìòrìty làddèr àbòvè chàngès thè càsè ìtsèlf. ••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Alerts notify people; the priority ladder above changes the case itself." |
*
* @param {Escalation_ExplainerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_explainer = /** @type {((inputs?: Escalation_ExplainerInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_ExplainerInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_escalation_explainer(inputs)
	if (locale === "en-XA") return en_xa2_escalation_explainer(inputs)
	return en_escalation_explainer(inputs)
});