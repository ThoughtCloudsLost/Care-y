/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reaction_CompleteInputs */

const en_reaction_complete = /** @type {(inputs: Reaction_CompleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Complete`)
};

const es_reaction_complete = /** @type {(inputs: Reaction_CompleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Completar`)
};

/**
* | output |
* | --- |
* | "Complete" |
*
* @param {Reaction_CompleteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reaction_complete = /** @type {((inputs?: Reaction_CompleteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reaction_CompleteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reaction_complete(inputs)
	return es_reaction_complete(inputs)
});