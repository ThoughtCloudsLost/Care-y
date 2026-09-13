/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Ticket_Tier_Account_Reset_ConfirmInputs */

const en_ticket_tier_account_reset_confirm = /** @type {(inputs: Ticket_Tier_Account_Reset_ConfirmInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Reset this account? The ${i?.client}'s message history will become permanently unreadable. You will need to create a new Secure Link and offer the upgrade again.`)
};

const es_ticket_tier_account_reset_confirm = /** @type {(inputs: Ticket_Tier_Account_Reset_ConfirmInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`¿Restablecer esta cuenta? El historial de mensajes del ${i?.client} quedará permanentemente ilegible. Necesitarás crear un nuevo enlace seguro y ofrecer la cuenta de nuevo.`)
};

/**
* | output |
* | --- |
* | "Reset this account? The {client}'s message history will become permanently unreadable. You will need to create a new Secure Link and offer the upgrade again." |
*
* @param {Ticket_Tier_Account_Reset_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_account_reset_confirm = /** @type {((inputs: Ticket_Tier_Account_Reset_ConfirmInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Account_Reset_ConfirmInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_tier_account_reset_confirm(inputs)
	return es_ticket_tier_account_reset_confirm(inputs)
});