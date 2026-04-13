/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Panel_No_MediaInputs */

const en_ticket_panel_no_media = /** @type {(inputs: Ticket_Panel_No_MediaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No attachments yet.`)
};

const es_ticket_panel_no_media = /** @type {(inputs: Ticket_Panel_No_MediaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin adjuntos todavia.`)
};

/**
* | output |
* | --- |
* | "No attachments yet." |
*
* @param {Ticket_Panel_No_MediaInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_no_media = /** @type {((inputs?: Ticket_Panel_No_MediaInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Panel_No_MediaInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_panel_no_media(inputs)
	return es_ticket_panel_no_media(inputs)
});