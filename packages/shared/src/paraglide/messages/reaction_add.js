/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reaction_AddInputs */

const en_reaction_add = /** @type {(inputs: Reaction_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add reaction`)
};

const es_reaction_add = /** @type {(inputs: Reaction_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar reacción`)
};

const en_xa2_reaction_add = /** @type {(inputs: Reaction_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd rèàctìòn ••••⟧`)
};

/**
* | output |
* | --- |
* | "Add reaction" |
*
* @param {Reaction_AddInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reaction_add = /** @type {((inputs?: Reaction_AddInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reaction_AddInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_reaction_add(inputs)
	if (locale === "en-XA") return en_xa2_reaction_add(inputs)
	return en_reaction_add(inputs)
});