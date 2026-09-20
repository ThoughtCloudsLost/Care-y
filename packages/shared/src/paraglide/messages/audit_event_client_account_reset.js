/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Client: NonNullable<unknown>, client: NonNullable<unknown> }} Audit_Event_Client_Account_ResetInputs */

const en_audit_event_client_account_reset = /** @type {(inputs: Audit_Event_Client_Account_ResetInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Client} account reset`)
};

const es_audit_event_client_account_reset = /** @type {(inputs: Audit_Event_Client_Account_ResetInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Cuenta de ${i?.client} restablecida`)
};

const en_xa2_audit_event_client_account_reset = /** @type {(inputs: Audit_Event_Client_Account_ResetInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Client} àccòùnt rèsèt •••••⟧`)
};

/**
* | output |
* | --- |
* | "{Client} account reset" |
*
* @param {Audit_Event_Client_Account_ResetInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_client_account_reset = /** @type {((inputs: Audit_Event_Client_Account_ResetInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Client_Account_ResetInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_client_account_reset(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_client_account_reset(inputs)
	return en_audit_event_client_account_reset(inputs)
});