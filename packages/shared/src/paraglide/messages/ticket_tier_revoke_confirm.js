/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Ticket_Tier_Revoke_ConfirmInputs */

const en_ticket_tier_revoke_confirm = /** @type {(inputs: Ticket_Tier_Revoke_ConfirmInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Revoke this link? The ${i?.client} will no longer be able to read or send messages through the portal. You can generate a new link afterward.`)
};

const es_ticket_tier_revoke_confirm = /** @type {(inputs: Ticket_Tier_Revoke_ConfirmInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`¿Revocar este enlace? El ${i?.client} ya no podrá leer ni enviar mensajes a través del portal. Puedes generar un enlace nuevo después.`)
};

/**
* | output |
* | --- |
* | "Revoke this link? The {client} will no longer be able to read or send messages through the portal. You can generate a new link afterward." |
*
* @param {Ticket_Tier_Revoke_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_revoke_confirm = /** @type {((inputs: Ticket_Tier_Revoke_ConfirmInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Revoke_ConfirmInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_tier_revoke_confirm(inputs)
	return es_ticket_tier_revoke_confirm(inputs)
});