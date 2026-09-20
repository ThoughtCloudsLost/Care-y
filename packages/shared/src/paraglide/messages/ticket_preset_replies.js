/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Preset_RepliesInputs */

const en_ticket_preset_replies = /** @type {(inputs: Ticket_Preset_RepliesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preset replies`)
};

const es_ticket_preset_replies = /** @type {(inputs: Ticket_Preset_RepliesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuestas predefinidas`)
};

const en_xa2_ticket_preset_replies = /** @type {(inputs: Ticket_Preset_RepliesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Prèsèt rèplìès •••••⟧`)
};

/**
* | output |
* | --- |
* | "Preset replies" |
*
* @param {Ticket_Preset_RepliesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_preset_replies = /** @type {((inputs?: Ticket_Preset_RepliesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Preset_RepliesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_preset_replies(inputs)
	if (locale === "en-XA") return en_xa2_ticket_preset_replies(inputs)
	return en_ticket_preset_replies(inputs)
});