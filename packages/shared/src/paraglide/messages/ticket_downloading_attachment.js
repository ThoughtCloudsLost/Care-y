/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ filename: NonNullable<unknown> }} Ticket_Downloading_AttachmentInputs */

const en_ticket_downloading_attachment = /** @type {(inputs: Ticket_Downloading_AttachmentInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Downloading ${i?.filename}...`)
};

const es_ticket_downloading_attachment = /** @type {(inputs: Ticket_Downloading_AttachmentInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Descargando ${i?.filename}...`)
};

/**
* | output |
* | --- |
* | "Downloading {filename}..." |
*
* @param {Ticket_Downloading_AttachmentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_downloading_attachment = /** @type {((inputs: Ticket_Downloading_AttachmentInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Downloading_AttachmentInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_downloading_attachment(inputs)
	return es_ticket_downloading_attachment(inputs)
});