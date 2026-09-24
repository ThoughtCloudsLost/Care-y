/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Client: NonNullable<unknown>, client: NonNullable<unknown> }} Audit_Event_Client_Phone_ChangedInputs */

const en_audit_event_client_phone_changed = /** @type {(inputs: Audit_Event_Client_Phone_ChangedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Client} phone changed`)
};

const es_audit_event_client_phone_changed = /** @type {(inputs: Audit_Event_Client_Phone_ChangedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Teléfono de ${i?.client} cambiado`)
};

const en_xa2_audit_event_client_phone_changed = /** @type {(inputs: Audit_Event_Client_Phone_ChangedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Client} phònè chàngèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "{Client} phone changed" |
*
* @param {Audit_Event_Client_Phone_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_client_phone_changed = /** @type {((inputs: Audit_Event_Client_Phone_ChangedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Client_Phone_ChangedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_client_phone_changed(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_client_phone_changed(inputs)
	return en_audit_event_client_phone_changed(inputs)
});