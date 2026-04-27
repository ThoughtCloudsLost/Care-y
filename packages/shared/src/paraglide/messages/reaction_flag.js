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

/**
* | output |
* | --- |
* | "Flag" |
*
* @param {Reaction_FlagInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reaction_flag = /** @type {((inputs?: Reaction_FlagInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reaction_FlagInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reaction_flag(inputs)
	return es_reaction_flag(inputs)
});