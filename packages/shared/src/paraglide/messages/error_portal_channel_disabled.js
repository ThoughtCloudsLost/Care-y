/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Portal_Channel_DisabledInputs */

const en_error_portal_channel_disabled = /** @type {(inputs: Error_Portal_Channel_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Secure messaging is not enabled for this organization.`)
};

const es_error_portal_channel_disabled = /** @type {(inputs: Error_Portal_Channel_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La mensajería segura no está habilitada para esta organización.`)
};

/**
* | output |
* | --- |
* | "Secure messaging is not enabled for this organization." |
*
* @param {Error_Portal_Channel_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_portal_channel_disabled = /** @type {((inputs?: Error_Portal_Channel_DisabledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Portal_Channel_DisabledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_portal_channel_disabled(inputs)
	return es_error_portal_channel_disabled(inputs)
});