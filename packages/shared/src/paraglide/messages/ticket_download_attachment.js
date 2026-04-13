/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ filename: NonNullable<unknown> }} Ticket_Download_AttachmentInputs */

const en_ticket_download_attachment = /** @type {(inputs: Ticket_Download_AttachmentInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Download ${i?.filename}`)
};

const es_ticket_download_attachment = /** @type {(inputs: Ticket_Download_AttachmentInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Descargar ${i?.filename}`)
};

/**
* | output |
* | --- |
* | "Download {filename}" |
*
* @param {Ticket_Download_AttachmentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_download_attachment = /** @type {((inputs: Ticket_Download_AttachmentInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Download_AttachmentInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_download_attachment(inputs)
	return es_ticket_download_attachment(inputs)
});