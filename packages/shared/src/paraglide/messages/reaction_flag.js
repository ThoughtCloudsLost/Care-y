/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reaction_FlagInputs */

const en_reaction_flag = /** @type {(inputs: Reaction_FlagInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Flag`)
};

const es_reaction_flag = /** @type {(inputs: Reaction_FlagInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Marcar`)
};

const en_xa2_reaction_flag = /** @type {(inputs: Reaction_FlagInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Flàg ••⟧`)
};

/**
* | output |
* | --- |
* | "Flag" |
*
* @param {Reaction_FlagInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reaction_flag = /** @type {((inputs?: Reaction_FlagInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reaction_FlagInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_reaction_flag(inputs)
	if (locale === "en-XA") return en_xa2_reaction_flag(inputs)
	return en_reaction_flag(inputs)
});