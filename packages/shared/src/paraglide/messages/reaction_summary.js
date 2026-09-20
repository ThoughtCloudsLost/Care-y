/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reaction_SummaryInputs */

const en_reaction_summary = /** @type {(inputs: Reaction_SummaryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reactions`)
};

const es_reaction_summary = /** @type {(inputs: Reaction_SummaryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reacciones`)
};

const en_xa2_reaction_summary = /** @type {(inputs: Reaction_SummaryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèàctìòns •••⟧`)
};

/**
* | output |
* | --- |
* | "Reactions" |
*
* @param {Reaction_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reaction_summary = /** @type {((inputs?: Reaction_SummaryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reaction_SummaryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_reaction_summary(inputs)
	if (locale === "en-XA") return en_xa2_reaction_summary(inputs)
	return en_reaction_summary(inputs)
});