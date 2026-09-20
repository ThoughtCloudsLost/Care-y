/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Compose_Email_Expected_DismissInputs */

const en_ticket_compose_email_expected_dismiss = /** @type {(inputs: Ticket_Compose_Email_Expected_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dismiss email caution`)
};

const es_ticket_compose_email_expected_dismiss = /** @type {(inputs: Ticket_Compose_Email_Expected_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descartar aviso de correo`)
};

const en_xa2_ticket_compose_email_expected_dismiss = /** @type {(inputs: Ticket_Compose_Email_Expected_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsmìss èmàìl càùtìòn •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Dismiss email caution" |
*
* @param {Ticket_Compose_Email_Expected_DismissInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_compose_email_expected_dismiss = /** @type {((inputs?: Ticket_Compose_Email_Expected_DismissInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Compose_Email_Expected_DismissInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_compose_email_expected_dismiss(inputs)
	if (locale === "en-XA") return en_xa2_ticket_compose_email_expected_dismiss(inputs)
	return en_ticket_compose_email_expected_dismiss(inputs)
});