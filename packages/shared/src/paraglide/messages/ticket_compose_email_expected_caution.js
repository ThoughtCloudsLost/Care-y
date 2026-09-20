/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Compose_Email_Expected_CautionInputs */

const en_ticket_compose_email_expected_caution = /** @type {(inputs: Ticket_Compose_Email_Expected_CautionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The client's last message arrived by email. They may be expecting an email reply and might not see this message.`)
};

const es_ticket_compose_email_expected_caution = /** @type {(inputs: Ticket_Compose_Email_Expected_CautionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El último mensaje del cliente llegó por correo electrónico. Es posible que espere una respuesta por correo y no vea este mensaje.`)
};

const en_xa2_ticket_compose_email_expected_caution = /** @type {(inputs: Ticket_Compose_Email_Expected_CautionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè clìènt's làst mèssàgè àrrìvèd by èmàìl. Thèy mày bè èxpèctìng àn èmàìl rèply ànd mìght nòt sèè thìs mèssàgè. ••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The client's last message arrived by email. They may be expecting an email reply and might not see this message." |
*
* @param {Ticket_Compose_Email_Expected_CautionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_compose_email_expected_caution = /** @type {((inputs?: Ticket_Compose_Email_Expected_CautionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Compose_Email_Expected_CautionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_compose_email_expected_caution(inputs)
	if (locale === "en-XA") return en_xa2_ticket_compose_email_expected_caution(inputs)
	return en_ticket_compose_email_expected_caution(inputs)
});