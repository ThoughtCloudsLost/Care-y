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

/**
* | output |
* | --- |
* | "Reactions" |
*
* @param {Reaction_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reaction_summary = /** @type {((inputs?: Reaction_SummaryInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reaction_SummaryInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reaction_summary(inputs)
	return es_reaction_summary(inputs)
});