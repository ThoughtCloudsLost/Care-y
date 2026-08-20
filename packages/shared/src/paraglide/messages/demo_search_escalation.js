/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Search_EscalationInputs */

const en_demo_search_escalation = /** @type {(inputs: Demo_Search_EscalationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unlocking remaining tickets`)
};

const es_demo_search_escalation = /** @type {(inputs: Demo_Search_EscalationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desbloqueando tickets restantes`)
};

/**
* | output |
* | --- |
* | "Unlocking remaining tickets" |
*
* @param {Demo_Search_EscalationInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_search_escalation = /** @type {((inputs?: Demo_Search_EscalationInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Search_EscalationInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_search_escalation(inputs)
	return es_demo_search_escalation(inputs)
});