/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Panel_No_MediaInputs */

const en_ticket_panel_no_media = /** @type {(inputs: Ticket_Panel_No_MediaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No attachments yet.`)
};

const es_ticket_panel_no_media = /** @type {(inputs: Ticket_Panel_No_MediaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin adjuntos todavía.`)
};

const en_xa2_ticket_panel_no_media = /** @type {(inputs: Ticket_Panel_No_MediaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò àttàchmènts yèt. ••••••⟧`)
};

/**
* | output |
* | --- |
* | "No attachments yet." |
*
* @param {Ticket_Panel_No_MediaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_no_media = /** @type {((inputs?: Ticket_Panel_No_MediaInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Panel_No_MediaInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_panel_no_media(inputs)
	if (locale === "en-XA") return en_xa2_ticket_panel_no_media(inputs)
	return en_ticket_panel_no_media(inputs)
});