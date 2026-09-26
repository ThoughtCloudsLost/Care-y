/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Client: NonNullable<unknown>, client: NonNullable<unknown> }} Audit_Event_Client_DeletedInputs */

const en_audit_event_client_deleted = /** @type {(inputs: Audit_Event_Client_DeletedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Client} deleted`)
};

const es_audit_event_client_deleted = /** @type {(inputs: Audit_Event_Client_DeletedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Registro de ${i?.client} eliminado`)
};

const en_xa2_audit_event_client_deleted = /** @type {(inputs: Audit_Event_Client_DeletedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Client} dèlètèd •••⟧`)
};

/**
* | output |
* | --- |
* | "{Client} deleted" |
*
* @param {Audit_Event_Client_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_client_deleted = /** @type {((inputs: Audit_Event_Client_DeletedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Client_DeletedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_client_deleted(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_client_deleted(inputs)
	return en_audit_event_client_deleted(inputs)
});