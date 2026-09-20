/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reaction_YouInputs */

const en_reaction_you = /** @type {(inputs: Reaction_YouInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You`)
};

const es_reaction_you = /** @type {(inputs: Reaction_YouInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu`)
};

const en_xa2_reaction_you = /** @type {(inputs: Reaction_YouInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòù •⟧`)
};

/**
* | output |
* | --- |
* | "You" |
*
* @param {Reaction_YouInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reaction_you = /** @type {((inputs?: Reaction_YouInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reaction_YouInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_reaction_you(inputs)
	if (locale === "en-XA") return en_xa2_reaction_you(inputs)
	return en_reaction_you(inputs)
});