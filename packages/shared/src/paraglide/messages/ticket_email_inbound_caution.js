/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Email_Inbound_CautionInputs */

const en_ticket_email_inbound_caution = /** @type {(inputs: Ticket_Email_Inbound_CautionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This message arrived by email. Email is the easiest channel to fake. Check anything important in it before acting on it.`)
};

const es_ticket_email_inbound_caution = /** @type {(inputs: Ticket_Email_Inbound_CautionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este mensaje llegó por correo electrónico. El correo electrónico es el canal más fácil de falsificar. Verifica cualquier dato importante antes de actuar.`)
};

const en_xa2_ticket_email_inbound_caution = /** @type {(inputs: Ticket_Email_Inbound_CautionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs mèssàgè àrrìvèd by èmàìl. Èmàìl ìs thè èàsìèst chànnèl tò fàkè. Chèck ànythìng ìmpòrtànt ìn ìt bèfòrè àctìng òn ìt. ••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This message arrived by email. Email is the easiest channel to fake. Check anything important in it before acting on it." |
*
* @param {Ticket_Email_Inbound_CautionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_email_inbound_caution = /** @type {((inputs?: Ticket_Email_Inbound_CautionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_Inbound_CautionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_email_inbound_caution(inputs)
	if (locale === "en-XA") return en_xa2_ticket_email_inbound_caution(inputs)
	return en_ticket_email_inbound_caution(inputs)
});