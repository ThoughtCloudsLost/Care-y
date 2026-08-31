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

/**
* | output |
* | --- |
* | "{count} items could not be recovered." |
*
* @param {Reseed_PartialInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reseed_partial = /** @type {((inputs: Reseed_PartialInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reseed_PartialInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reseed_partial(inputs)
	return es_reseed_partial(inputs)
});