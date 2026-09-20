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

const en_xa2_error_portal_channel_disabled = /** @type {(inputs: Error_Portal_Channel_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sècùrè mèssàgìng ìs nòt ènàblèd fòr thìs òrgànìzàtìòn. •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Secure messaging is not enabled for this organization." |
*
* @param {Error_Portal_Channel_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_portal_channel_disabled = /** @type {((inputs?: Error_Portal_Channel_DisabledInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Portal_Channel_DisabledInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_portal_channel_disabled(inputs)
	if (locale === "en-XA") return en_xa2_error_portal_channel_disabled(inputs)
	return en_error_portal_channel_disabled(inputs)
});