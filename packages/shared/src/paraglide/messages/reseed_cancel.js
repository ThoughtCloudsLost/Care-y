/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reseed_CancelInputs */

const en_reseed_cancel = /** @type {(inputs: Reseed_CancelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cancel recovery`)
};

const es_reseed_cancel = /** @type {(inputs: Reseed_CancelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cancelar recuperación`)
};

/**
* | output |
* | --- |
* | "Cancel recovery" |
*
* @param {Reseed_CancelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reseed_cancel = /** @type {((inputs?: Reseed_CancelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reseed_CancelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reseed_cancel(inputs)
	return es_reseed_cancel(inputs)
});