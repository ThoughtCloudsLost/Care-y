/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reaction_DisagreeInputs */

const en_reaction_disagree = /** @type {(inputs: Reaction_DisagreeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Disagree`)
};

const es_reaction_disagree = /** @type {(inputs: Reaction_DisagreeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`En desacuerdo`)
};

/**
* | output |
* | --- |
* | "Disagree" |
*
* @param {Reaction_DisagreeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reaction_disagree = /** @type {((inputs?: Reaction_DisagreeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reaction_DisagreeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reaction_disagree(inputs)
	return es_reaction_disagree(inputs)
});