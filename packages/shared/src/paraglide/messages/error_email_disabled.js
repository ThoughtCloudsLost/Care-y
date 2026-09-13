/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Email_DisabledInputs */

const en_error_email_disabled = /** @type {(inputs: Error_Email_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email is not enabled for this organization.`)
};

const es_error_email_disabled = /** @type {(inputs: Error_Email_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El correo electrónico no está habilitado para esta organización.`)
};

/**
* | output |
* | --- |
* | "Email is not enabled for this organization." |
*
* @param {Error_Email_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_email_disabled = /** @type {((inputs?: Error_Email_DisabledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Email_DisabledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_email_disabled(inputs)
	return es_error_email_disabled(inputs)
});