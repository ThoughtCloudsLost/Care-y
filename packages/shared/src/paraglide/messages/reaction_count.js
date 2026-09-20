/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown>, label: NonNullable<unknown> }} Reaction_CountInputs */

const en_reaction_count = /** @type {(inputs: Reaction_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.label}`)
};

const es_reaction_count = /** @type {(inputs: Reaction_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.label}`)
};

const en_xa2_reaction_count = /** @type {(inputs: Reaction_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count}  •${i?.label}⟧`)
};

/**
* | output |
* | --- |
* | "{count} {label}" |
*
* @param {Reaction_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reaction_count = /** @type {((inputs: Reaction_CountInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reaction_CountInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_reaction_count(inputs)
	if (locale === "en-XA") return en_xa2_reaction_count(inputs)
	return en_reaction_count(inputs)
});