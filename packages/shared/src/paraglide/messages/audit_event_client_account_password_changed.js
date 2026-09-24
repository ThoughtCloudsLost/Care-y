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

const en_xa2_audit_event_client_account_password_changed = /** @type {(inputs: Audit_Event_Client_Account_Password_ChangedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Client} àccòùnt pàsswòrd chàngèd ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "{Client} account password changed" |
*
* @param {Audit_Event_Client_Account_Password_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_client_account_password_changed = /** @type {((inputs: Audit_Event_Client_Account_Password_ChangedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Client_Account_Password_ChangedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_client_account_password_changed(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_client_account_password_changed(inputs)
	return en_audit_event_client_account_password_changed(inputs)
});