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

const en_xa2_error_portal_channel_not_found = /** @type {(inputs: Error_Portal_Channel_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs sècùrè lìnk ìs nòt àvàìlàblè. Ìt mày hàvè bèèn rèvòkèd òr nèvèr èxìstèd. ••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This secure link is not available. It may have been revoked or never existed." |
*
* @param {Error_Portal_Channel_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_portal_channel_not_found = /** @type {((inputs?: Error_Portal_Channel_Not_FoundInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Portal_Channel_Not_FoundInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_portal_channel_not_found(inputs)
	if (locale === "en-XA") return en_xa2_error_portal_channel_not_found(inputs)
	return en_error_portal_channel_not_found(inputs)
});