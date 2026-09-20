/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Toast_Account_ResetInputs */

const en_ticket_toast_account_reset = /** @type {(inputs: Ticket_Toast_Account_ResetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account reset`)
};

const es_ticket_toast_account_reset = /** @type {(inputs: Ticket_Toast_Account_ResetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuenta restablecida`)
};

const en_xa2_ticket_toast_account_reset = /** @type {(inputs: Ticket_Toast_Account_ResetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àccòùnt rèsèt ••••⟧`)
};

/**
* | output |
* | --- |
* | "Account reset" |
*
* @param {Ticket_Toast_Account_ResetInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_account_reset = /** @type {((inputs?: Ticket_Toast_Account_ResetInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_Account_ResetInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_toast_account_reset(inputs)
	if (locale === "en-XA") return en_xa2_ticket_toast_account_reset(inputs)
	return en_ticket_toast_account_reset(inputs)
});