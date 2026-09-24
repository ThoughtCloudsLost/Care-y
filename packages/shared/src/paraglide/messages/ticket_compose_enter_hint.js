/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Compose_Enter_HintInputs */

const en_ticket_compose_enter_hint = /** @type {(inputs: Ticket_Compose_Enter_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter to send, Shift+Enter for new line`)
};

const es_ticket_compose_enter_hint = /** @type {(inputs: Ticket_Compose_Enter_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter para enviar, Shift+Enter para nueva línea`)
};

const en_xa2_ticket_compose_enter_hint = /** @type {(inputs: Ticket_Compose_Enter_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntèr tò sènd, Shìft+Èntèr fòr nèw lìnè ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enter to send, Shift+Enter for new line" |
*
* @param {Ticket_Compose_Enter_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_compose_enter_hint = /** @type {((inputs?: Ticket_Compose_Enter_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Compose_Enter_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_compose_enter_hint(inputs)
	if (locale === "en-XA") return en_xa2_ticket_compose_enter_hint(inputs)
	return en_ticket_compose_enter_hint(inputs)
});