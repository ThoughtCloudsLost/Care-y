/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Donation_Connection_RemovedInputs */

const en_audit_event_donation_connection_removed = /** @type {(inputs: Audit_Event_Donation_Connection_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Donation provider disconnected`)
};

const es_audit_event_donation_connection_removed = /** @type {(inputs: Audit_Event_Donation_Connection_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Proveedor de donaciones desconectado`)
};

const en_xa2_audit_event_donation_connection_removed = /** @type {(inputs: Audit_Event_Donation_Connection_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dònàtìòn pròvìdèr dìscònnèctèd •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Donation provider disconnected" |
*
* @param {Audit_Event_Donation_Connection_RemovedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_donation_connection_removed = /** @type {((inputs?: Audit_Event_Donation_Connection_RemovedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Donation_Connection_RemovedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_donation_connection_removed(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_donation_connection_removed(inputs)
	return en_audit_event_donation_connection_removed(inputs)
});