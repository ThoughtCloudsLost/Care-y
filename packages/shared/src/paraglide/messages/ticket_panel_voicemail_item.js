/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Panel_Voicemail_ItemInputs */

const en_ticket_panel_voicemail_item = /** @type {(inputs: Ticket_Panel_Voicemail_ItemInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voicemail`)
};

const es_ticket_panel_voicemail_item = /** @type {(inputs: Ticket_Panel_Voicemail_ItemInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mensaje de voz`)
};

/**
* | output |
* | --- |
* | "Voicemail" |
*
* @param {Ticket_Panel_Voicemail_ItemInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_voicemail_item = /** @type {((inputs?: Ticket_Panel_Voicemail_ItemInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Panel_Voicemail_ItemInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_panel_voicemail_item(inputs)
	return es_ticket_panel_voicemail_item(inputs)
});