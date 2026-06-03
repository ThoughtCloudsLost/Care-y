/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Method_RemovedInputs */

const en_twofa_method_removed = /** @type {(inputs: Twofa_Method_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verification method removed`)
};

const es_twofa_method_removed = /** @type {(inputs: Twofa_Method_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Método de verificación eliminado`)
};

/**
* | output |
* | --- |
* | "Verification method removed" |
*
* @param {Twofa_Method_RemovedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_method_removed = /** @type {((inputs?: Twofa_Method_RemovedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Method_RemovedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_method_removed(inputs)
	return es_twofa_method_removed(inputs)
});