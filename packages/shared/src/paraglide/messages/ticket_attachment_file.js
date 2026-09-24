/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ filename: NonNullable<unknown>, size: NonNullable<unknown> }} Ticket_Attachment_FileInputs */

const en_ticket_attachment_file = /** @type {(inputs: Ticket_Attachment_FileInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`File: ${i?.filename} (${i?.size})`)
};

const es_ticket_attachment_file = /** @type {(inputs: Ticket_Attachment_FileInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Archivo: ${i?.filename} (${i?.size})`)
};

const en_xa2_ticket_attachment_file = /** @type {(inputs: Ticket_Attachment_FileInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Fìlè:  ••${i?.filename} ( •${i?.size}) •⟧`)
};

/**
* | output |
* | --- |
* | "File: {filename} ({size})" |
*
* @param {Ticket_Attachment_FileInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_attachment_file = /** @type {((inputs: Ticket_Attachment_FileInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Attachment_FileInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_attachment_file(inputs)
	if (locale === "en-XA") return en_xa2_ticket_attachment_file(inputs)
	return en_ticket_attachment_file(inputs)
});