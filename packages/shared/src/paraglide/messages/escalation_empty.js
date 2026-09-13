/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_EmptyInputs */

const en_escalation_empty = /** @type {(inputs: Escalation_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No escalation alerts for this queue yet.`)
};

const es_escalation_empty = /** @type {(inputs: Escalation_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay alertas de escalamiento para esta cola.`)
};

/**
* | output |
* | --- |
* | "No escalation alerts for this queue yet." |
*
* @param {Escalation_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_empty = /** @type {((inputs?: Escalation_EmptyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_EmptyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_escalation_empty(inputs)
	return es_escalation_empty(inputs)
});