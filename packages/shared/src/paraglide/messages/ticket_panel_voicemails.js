/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Panel_VoicemailsInputs */

const en_ticket_panel_voicemails = /** @type {(inputs: Ticket_Panel_VoicemailsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voicemails`)
};

const es_ticket_panel_voicemails = /** @type {(inputs: Ticket_Panel_VoicemailsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mensajes de voz`)
};

const en_xa2_ticket_panel_voicemails = /** @type {(inputs: Ticket_Panel_VoicemailsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòìcèmàìls •••⟧`)
};

/**
* | output |
* | --- |
* | "Voicemails" |
*
* @param {Ticket_Panel_VoicemailsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_voicemails = /** @type {((inputs?: Ticket_Panel_VoicemailsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Panel_VoicemailsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_panel_voicemails(inputs)
	if (locale === "en-XA") return en_xa2_ticket_panel_voicemails(inputs)
	return en_ticket_panel_voicemails(inputs)
});