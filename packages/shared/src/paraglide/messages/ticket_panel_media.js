/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Panel_MediaInputs */

const en_ticket_panel_media = /** @type {(inputs: Ticket_Panel_MediaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Images`)
};

const es_ticket_panel_media = /** @type {(inputs: Ticket_Panel_MediaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Imagenes`)
};

/**
* | output |
* | --- |
* | "Images" |
*
* @param {Ticket_Panel_MediaInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_media = /** @type {((inputs?: Ticket_Panel_MediaInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Panel_MediaInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_panel_media(inputs)
	return es_ticket_panel_media(inputs)
});