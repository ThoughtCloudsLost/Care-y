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

const en_xa2_ticket_tier_account_reset_confirm = /** @type {(inputs: Ticket_Tier_Account_Reset_ConfirmInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Rèsèt thìs àccòùnt? Thè  ••••••••${i?.client}'s mèssàgè hìstòry wìll bècòmè pèrmànèntly ùnrèàdàblè. Yòù wìll nèèd tò crèàtè à nèw Sècùrè Lìnk ànd òffèr thè ùpgràdè àgàìn. ••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Reset this account? The {client}'s message history will become permanently unreadable. You will need to create a new Secure Link and offer the upgrade again." |
*
* @param {Ticket_Tier_Account_Reset_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_account_reset_confirm = /** @type {((inputs: Ticket_Tier_Account_Reset_ConfirmInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Account_Reset_ConfirmInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_tier_account_reset_confirm(inputs)
	if (locale === "en-XA") return en_xa2_ticket_tier_account_reset_confirm(inputs)
	return en_ticket_tier_account_reset_confirm(inputs)
});