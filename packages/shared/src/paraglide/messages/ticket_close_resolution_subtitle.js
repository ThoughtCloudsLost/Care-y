/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Close_Resolution_SubtitleInputs */

const en_ticket_close_resolution_subtitle = /** @type {(inputs: Ticket_Close_Resolution_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add a note before closing (optional)`)
};

const es_ticket_close_resolution_subtitle = /** @type {(inputs: Ticket_Close_Resolution_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agrega una nota antes de cerrar (opcional)`)
};

const en_xa2_ticket_close_resolution_subtitle = /** @type {(inputs: Ticket_Close_Resolution_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd à nòtè bèfòrè clòsìng (òptìònàl) •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Add a note before closing (optional)" |
*
* @param {Ticket_Close_Resolution_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_close_resolution_subtitle = /** @type {((inputs?: Ticket_Close_Resolution_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Close_Resolution_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_close_resolution_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_ticket_close_resolution_subtitle(inputs)
	return en_ticket_close_resolution_subtitle(inputs)
});