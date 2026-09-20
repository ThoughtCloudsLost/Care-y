/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_Regenerate_Continuation_ConfirmInputs */

const en_ticket_tier_regenerate_continuation_confirm = /** @type {(inputs: Ticket_Tier_Regenerate_Continuation_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Regenerating will replace the continuation link with a new volunteer-issued Secure Link. The caller's original link will stop working.`)
};

const es_ticket_tier_regenerate_continuation_confirm = /** @type {(inputs: Ticket_Tier_Regenerate_Continuation_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Regenerar reemplazará el enlace de continuación con un nuevo enlace seguro emitido por un voluntario. El enlace original dejará de funcionar.`)
};

const en_xa2_ticket_tier_regenerate_continuation_confirm = /** @type {(inputs: Ticket_Tier_Regenerate_Continuation_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Règènèràtìng wìll rèplàcè thè còntìnùàtìòn lìnk wìth à nèw vòlùntèèr-ìssùèd Sècùrè Lìnk. Thè càllèr's òrìgìnàl lìnk wìll stòp wòrkìng. •••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Regenerating will replace the continuation link with a new volunteer-issued Secure Link. The caller's original link will stop working." |
*
* @param {Ticket_Tier_Regenerate_Continuation_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_regenerate_continuation_confirm = /** @type {((inputs?: Ticket_Tier_Regenerate_Continuation_ConfirmInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Regenerate_Continuation_ConfirmInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_tier_regenerate_continuation_confirm(inputs)
	if (locale === "en-XA") return en_xa2_ticket_tier_regenerate_continuation_confirm(inputs)
	return en_ticket_tier_regenerate_continuation_confirm(inputs)
});