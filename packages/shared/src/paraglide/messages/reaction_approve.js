/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reaction_ApproveInputs */

const en_reaction_approve = /** @type {(inputs: Reaction_ApproveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Approve`)
};

const es_reaction_approve = /** @type {(inputs: Reaction_ApproveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aprobar`)
};

/**
* | output |
* | --- |
* | "Approve" |
*
* @param {Reaction_ApproveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reaction_approve = /** @type {((inputs?: Reaction_ApproveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reaction_ApproveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reaction_approve(inputs)
	return es_reaction_approve(inputs)
});