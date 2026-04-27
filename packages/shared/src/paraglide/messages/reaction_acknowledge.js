/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reaction_AcknowledgeInputs */

const en_reaction_acknowledge = /** @type {(inputs: Reaction_AcknowledgeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Acknowledge`)
};

const es_reaction_acknowledge = /** @type {(inputs: Reaction_AcknowledgeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reconocer`)
};

/**
* | output |
* | --- |
* | "Acknowledge" |
*
* @param {Reaction_AcknowledgeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reaction_acknowledge = /** @type {((inputs?: Reaction_AcknowledgeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reaction_AcknowledgeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reaction_acknowledge(inputs)
	return es_reaction_acknowledge(inputs)
});