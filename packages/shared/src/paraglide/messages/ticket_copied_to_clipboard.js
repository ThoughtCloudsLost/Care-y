/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Copied_To_ClipboardInputs */

const en_ticket_copied_to_clipboard = /** @type {(inputs: Ticket_Copied_To_ClipboardInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copied to clipboard`)
};

const es_ticket_copied_to_clipboard = /** @type {(inputs: Ticket_Copied_To_ClipboardInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copiado al portapapeles`)
};

const en_xa2_ticket_copied_to_clipboard = /** @type {(inputs: Ticket_Copied_To_ClipboardInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còpìèd tò clìpbòàrd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Copied to clipboard" |
*
* @param {Ticket_Copied_To_ClipboardInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_copied_to_clipboard = /** @type {((inputs?: Ticket_Copied_To_ClipboardInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Copied_To_ClipboardInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_copied_to_clipboard(inputs)
	if (locale === "en-XA") return en_xa2_ticket_copied_to_clipboard(inputs)
	return en_ticket_copied_to_clipboard(inputs)
});