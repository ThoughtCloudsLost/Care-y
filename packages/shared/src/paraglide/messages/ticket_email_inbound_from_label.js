/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ from: NonNullable<unknown> }} Ticket_Email_Inbound_From_LabelInputs */

const en_ticket_email_inbound_from_label = /** @type {(inputs: Ticket_Email_Inbound_From_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`From: ${i?.from} (unverified)`)
};

const es_ticket_email_inbound_from_label = /** @type {(inputs: Ticket_Email_Inbound_From_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`De: ${i?.from} (no verificado)`)
};

const en_xa2_ticket_email_inbound_from_label = /** @type {(inputs: Ticket_Email_Inbound_From_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Fròm:  ••${i?.from} (ùnvèrìfìèd) ••••⟧`)
};

/**
* | output |
* | --- |
* | "From: {from} (unverified)" |
*
* @param {Ticket_Email_Inbound_From_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_email_inbound_from_label = /** @type {((inputs: Ticket_Email_Inbound_From_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_Inbound_From_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_email_inbound_from_label(inputs)
	if (locale === "en-XA") return en_xa2_ticket_email_inbound_from_label(inputs)
	return en_ticket_email_inbound_from_label(inputs)
});