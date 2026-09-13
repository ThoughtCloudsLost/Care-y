/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Portal_Channel_Not_FoundInputs */

const en_error_portal_channel_not_found = /** @type {(inputs: Error_Portal_Channel_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This secure link is not available. It may have been revoked or never existed.`)
};

const es_error_portal_channel_not_found = /** @type {(inputs: Error_Portal_Channel_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este enlace seguro no está disponible. Es posible que haya sido revocado o que nunca haya existido.`)
};

/**
* | output |
* | --- |
* | "This secure link is not available. It may have been revoked or never existed." |
*
* @param {Error_Portal_Channel_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_portal_channel_not_found = /** @type {((inputs?: Error_Portal_Channel_Not_FoundInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Portal_Channel_Not_FoundInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_portal_channel_not_found(inputs)
	return es_error_portal_channel_not_found(inputs)
});