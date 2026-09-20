/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Context_Menu_TitleInputs */

const en_ticket_context_menu_title = /** @type {(inputs: Ticket_Context_Menu_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Message Actions`)
};

const es_ticket_context_menu_title = /** @type {(inputs: Ticket_Context_Menu_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Acciones del mensaje`)
};

const en_xa2_ticket_context_menu_title = /** @type {(inputs: Ticket_Context_Menu_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mèssàgè Àctìòns •••••⟧`)
};

/**
* | output |
* | --- |
* | "Message Actions" |
*
* @param {Ticket_Context_Menu_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_context_menu_title = /** @type {((inputs?: Ticket_Context_Menu_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Context_Menu_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_context_menu_title(inputs)
	if (locale === "en-XA") return en_xa2_ticket_context_menu_title(inputs)
	return en_ticket_context_menu_title(inputs)
});