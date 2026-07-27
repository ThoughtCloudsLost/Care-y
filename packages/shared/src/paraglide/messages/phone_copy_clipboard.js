/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Phone_Copy_ClipboardInputs */

const en_phone_copy_clipboard = /** @type {(inputs: Phone_Copy_ClipboardInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copy phone number`)
};

const es_phone_copy_clipboard = /** @type {(inputs: Phone_Copy_ClipboardInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copiar numero de telefono`)
};

/**
* | output |
* | --- |
* | "Copy phone number" |
*
* @param {Phone_Copy_ClipboardInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const phone_copy_clipboard = /** @type {((inputs?: Phone_Copy_ClipboardInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Phone_Copy_ClipboardInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_phone_copy_clipboard(inputs)
	return es_phone_copy_clipboard(inputs)
});