/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Portal_Reseed_ValidationInputs */

const en_error_portal_reseed_validation = /** @type {(inputs: Error_Portal_Reseed_ValidationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Some messages could not be recovered.`)
};

const es_error_portal_reseed_validation = /** @type {(inputs: Error_Portal_Reseed_ValidationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Algunos mensajes no se pudieron recuperar.`)
};

/**
* | output |
* | --- |
* | "Some messages could not be recovered." |
*
* @param {Error_Portal_Reseed_ValidationInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_portal_reseed_validation = /** @type {((inputs?: Error_Portal_Reseed_ValidationInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Portal_Reseed_ValidationInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_portal_reseed_validation(inputs)
	return es_error_portal_reseed_validation(inputs)
});