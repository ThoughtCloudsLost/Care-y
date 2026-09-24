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

const en_xa2_reaction_approve = /** @type {(inputs: Reaction_ApproveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àppròvè •••⟧`)
};

/**
* | output |
* | --- |
* | "Approve" |
*
* @param {Reaction_ApproveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reaction_approve = /** @type {((inputs?: Reaction_ApproveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reaction_ApproveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_reaction_approve(inputs)
	if (locale === "en-XA") return en_xa2_reaction_approve(inputs)
	return en_reaction_approve(inputs)
});