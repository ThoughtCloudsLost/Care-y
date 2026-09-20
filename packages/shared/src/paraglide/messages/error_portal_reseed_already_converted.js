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

const en_xa2_error_portal_reseed_already_converted = /** @type {(inputs: Error_Portal_Reseed_Already_ConvertedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs fìlè wàs àlrèàdy rècòvèrèd. ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This file was already recovered." |
*
* @param {Error_Portal_Reseed_Already_ConvertedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_portal_reseed_already_converted = /** @type {((inputs?: Error_Portal_Reseed_Already_ConvertedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Portal_Reseed_Already_ConvertedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_portal_reseed_already_converted(inputs)
	if (locale === "en-XA") return en_xa2_error_portal_reseed_already_converted(inputs)
	return en_error_portal_reseed_already_converted(inputs)
});