/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Client: NonNullable<unknown>, client: NonNullable<unknown> }} Audit_Event_Client_Account_Password_ChangedInputs */

const en_audit_event_client_account_password_changed = /** @type {(inputs: Audit_Event_Client_Account_Password_ChangedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Client} account password changed`)
};

const es_audit_event_client_account_password_changed = /** @type {(inputs: Audit_Event_Client_Account_Password_ChangedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Contraseña de cuenta de ${i?.client} cambiada`)
};

/**
* | output |
* | --- |
* | "{Client} account password changed" |
*
* @param {Audit_Event_Client_Account_Password_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_client_account_password_changed = /** @type {((inputs: Audit_Event_Client_Account_Password_ChangedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Client_Account_Password_ChangedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_client_account_password_changed(inputs)
	return es_audit_event_client_account_password_changed(inputs)
});