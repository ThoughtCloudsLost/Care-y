/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Portal_Reseed_Already_ConvertedInputs */

const en_error_portal_reseed_already_converted = /** @type {(inputs: Error_Portal_Reseed_Already_ConvertedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This file was already recovered.`)
};

const es_error_portal_reseed_already_converted = /** @type {(inputs: Error_Portal_Reseed_Already_ConvertedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este archivo ya se recuperó.`)
};

/**
* | output |
* | --- |
* | "This file was already recovered." |
*
* @param {Error_Portal_Reseed_Already_ConvertedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_portal_reseed_already_converted = /** @type {((inputs?: Error_Portal_Reseed_Already_ConvertedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Portal_Reseed_Already_ConvertedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_portal_reseed_already_converted(inputs)
	return es_error_portal_reseed_already_converted(inputs)
});