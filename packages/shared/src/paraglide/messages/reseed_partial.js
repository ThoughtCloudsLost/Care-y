/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Reseed_PartialInputs */

const en_reseed_partial = /** @type {(inputs: Reseed_PartialInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} items could not be recovered.`)
};

const es_reseed_partial = /** @type {(inputs: Reseed_PartialInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} elementos no se pudieron recuperar.`)
};

const en_xa2_reseed_partial = /** @type {(inputs: Reseed_PartialInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} ìtèms còùld nòt bè rècòvèrèd. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "{count} items could not be recovered." |
*
* @param {Reseed_PartialInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reseed_partial = /** @type {((inputs: Reseed_PartialInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reseed_PartialInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_reseed_partial(inputs)
	if (locale === "en-XA") return en_xa2_reseed_partial(inputs)
	return en_reseed_partial(inputs)
});