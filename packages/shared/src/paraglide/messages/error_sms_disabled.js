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

/**
* | output |
* | --- |
* | "SMS is not enabled for this organization." |
*
* @param {Error_Sms_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_sms_disabled = /** @type {((inputs?: Error_Sms_DisabledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Sms_DisabledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_sms_disabled(inputs)
	return es_error_sms_disabled(inputs)
});