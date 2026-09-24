/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Panel_FilesInputs */

const en_ticket_panel_files = /** @type {(inputs: Ticket_Panel_FilesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Files`)
};

const es_ticket_panel_files = /** @type {(inputs: Ticket_Panel_FilesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Archivos`)
};

const en_xa2_ticket_panel_files = /** @type {(inputs: Ticket_Panel_FilesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìlès ••⟧`)
};

/**
* | output |
* | --- |
* | "Files" |
*
* @param {Ticket_Panel_FilesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_files = /** @type {((inputs?: Ticket_Panel_FilesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Panel_FilesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_panel_files(inputs)
	if (locale === "en-XA") return en_xa2_ticket_panel_files(inputs)
	return en_ticket_panel_files(inputs)
});