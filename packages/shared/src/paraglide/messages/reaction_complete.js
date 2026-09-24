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

const en_xa2_reaction_complete = /** @type {(inputs: Reaction_CompleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còmplètè •••⟧`)
};

/**
* | output |
* | --- |
* | "Complete" |
*
* @param {Reaction_CompleteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reaction_complete = /** @type {((inputs?: Reaction_CompleteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reaction_CompleteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_reaction_complete(inputs)
	if (locale === "en-XA") return en_xa2_reaction_complete(inputs)
	return en_reaction_complete(inputs)
});