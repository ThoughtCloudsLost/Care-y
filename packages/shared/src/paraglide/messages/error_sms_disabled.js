/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Sms_DisabledInputs */

const en_error_sms_disabled = /** @type {(inputs: Error_Sms_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SMS is not enabled for this organization.`)
};

const es_error_sms_disabled = /** @type {(inputs: Error_Sms_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los SMS no están habilitados para esta organización.`)
};

const en_xa2_error_sms_disabled = /** @type {(inputs: Error_Sms_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦SMS ìs nòt ènàblèd fòr thìs òrgànìzàtìòn. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "SMS is not enabled for this organization." |
*
* @param {Error_Sms_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_sms_disabled = /** @type {((inputs?: Error_Sms_DisabledInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Sms_DisabledInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_sms_disabled(inputs)
	if (locale === "en-XA") return en_xa2_error_sms_disabled(inputs)
	return en_error_sms_disabled(inputs)
});