/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reaction_AddInputs */

const en_reaction_add = /** @type {(inputs: Reaction_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add reaction`)
};

const es_reaction_add = /** @type {(inputs: Reaction_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar reaccion`)
};

/**
* | output |
* | --- |
* | "Add reaction" |
*
* @param {Reaction_AddInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reaction_add = /** @type {((inputs?: Reaction_AddInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reaction_AddInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reaction_add(inputs)
	return es_reaction_add(inputs)
});