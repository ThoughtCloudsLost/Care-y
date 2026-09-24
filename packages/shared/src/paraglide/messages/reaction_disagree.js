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

const en_xa2_reaction_disagree = /** @type {(inputs: Reaction_DisagreeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsàgrèè •••⟧`)
};

/**
* | output |
* | --- |
* | "Disagree" |
*
* @param {Reaction_DisagreeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reaction_disagree = /** @type {((inputs?: Reaction_DisagreeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reaction_DisagreeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_reaction_disagree(inputs)
	if (locale === "en-XA") return en_xa2_reaction_disagree(inputs)
	return en_reaction_disagree(inputs)
});