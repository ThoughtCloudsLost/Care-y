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

const en_xa2_error_email_disabled = /** @type {(inputs: Error_Email_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èmàìl ìs nòt ènàblèd fòr thìs òrgànìzàtìòn. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Email is not enabled for this organization." |
*
* @param {Error_Email_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_email_disabled = /** @type {((inputs?: Error_Email_DisabledInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Email_DisabledInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_email_disabled(inputs)
	if (locale === "en-XA") return en_xa2_error_email_disabled(inputs)
	return en_error_email_disabled(inputs)
});