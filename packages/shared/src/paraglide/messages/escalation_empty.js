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

const en_xa2_escalation_empty = /** @type {(inputs: Escalation_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò èscàlàtìòn àlèrts fòr thìs qùèùè yèt. ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No escalation alerts for this queue yet." |
*
* @param {Escalation_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_empty = /** @type {((inputs?: Escalation_EmptyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_EmptyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_escalation_empty(inputs)
	if (locale === "en-XA") return en_xa2_escalation_empty(inputs)
	return en_escalation_empty(inputs)
});