/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Client: NonNullable<unknown>, client: NonNullable<unknown> }} Audit_Event_Client_Account_CreatedInputs */

const en_audit_event_client_account_created = /** @type {(inputs: Audit_Event_Client_Account_CreatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Client} account created`)
};

const es_audit_event_client_account_created = /** @type {(inputs: Audit_Event_Client_Account_CreatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Cuenta de ${i?.client} creada`)
};

const en_xa2_audit_event_client_account_created = /** @type {(inputs: Audit_Event_Client_Account_CreatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Client} àccòùnt crèàtèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "{Client} account created" |
*
* @param {Audit_Event_Client_Account_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_client_account_created = /** @type {((inputs: Audit_Event_Client_Account_CreatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Client_Account_CreatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_client_account_created(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_client_account_created(inputs)
	return en_audit_event_client_account_created(inputs)
});