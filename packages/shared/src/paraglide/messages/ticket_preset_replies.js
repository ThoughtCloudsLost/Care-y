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

/**
* | output |
* | --- |
* | "Preset replies" |
*
* @param {Ticket_Preset_RepliesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_preset_replies = /** @type {((inputs?: Ticket_Preset_RepliesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Preset_RepliesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_preset_replies(inputs)
	return es_ticket_preset_replies(inputs)
});