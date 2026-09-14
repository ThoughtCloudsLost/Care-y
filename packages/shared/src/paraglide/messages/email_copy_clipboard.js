/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Email_Copy_ClipboardInputs */

const en_email_copy_clipboard = /** @type {(inputs: Email_Copy_ClipboardInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copy email address`)
};

const es_email_copy_clipboard = /** @type {(inputs: Email_Copy_ClipboardInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copiar dirección de correo`)
};

/**
* | output |
* | --- |
* | "Copy email address" |
*
* @param {Email_Copy_ClipboardInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const email_copy_clipboard = /** @type {((inputs?: Email_Copy_ClipboardInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Email_Copy_ClipboardInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_email_copy_clipboard(inputs)
	return en_email_copy_clipboard(inputs)
});