/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Voice_DisabledInputs */

const en_error_voice_disabled = /** @type {(inputs: Error_Voice_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voice calls are not enabled for this organization.`)
};

const es_error_voice_disabled = /** @type {(inputs: Error_Voice_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las llamadas de voz no están habilitadas para esta organización.`)
};

const en_xa2_error_voice_disabled = /** @type {(inputs: Error_Voice_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòìcè càlls àrè nòt ènàblèd fòr thìs òrgànìzàtìòn. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Voice calls are not enabled for this organization." |
*
* @param {Error_Voice_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_voice_disabled = /** @type {((inputs?: Error_Voice_DisabledInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Voice_DisabledInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_voice_disabled(inputs)
	if (locale === "en-XA") return en_xa2_error_voice_disabled(inputs)
	return en_error_voice_disabled(inputs)
});