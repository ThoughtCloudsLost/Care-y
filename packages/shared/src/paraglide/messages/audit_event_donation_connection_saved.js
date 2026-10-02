/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Donation_Connection_SavedInputs */

const en_audit_event_donation_connection_saved = /** @type {(inputs: Audit_Event_Donation_Connection_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Donation provider connected`)
};

const es_audit_event_donation_connection_saved = /** @type {(inputs: Audit_Event_Donation_Connection_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Proveedor de donaciones conectado`)
};

const en_xa2_audit_event_donation_connection_saved = /** @type {(inputs: Audit_Event_Donation_Connection_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dònàtìòn pròvìdèr cònnèctèd •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Donation provider connected" |
*
* @param {Audit_Event_Donation_Connection_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_donation_connection_saved = /** @type {((inputs?: Audit_Event_Donation_Connection_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Donation_Connection_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_donation_connection_saved(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_donation_connection_saved(inputs)
	return en_audit_event_donation_connection_saved(inputs)
});