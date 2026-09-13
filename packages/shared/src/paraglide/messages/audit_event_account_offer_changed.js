/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Account_Offer_ChangedInputs */

const en_audit_event_account_offer_changed = /** @type {(inputs: Audit_Event_Account_Offer_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account offer changed`)
};

const es_audit_event_account_offer_changed = /** @type {(inputs: Audit_Event_Account_Offer_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Oferta de cuenta cambiada`)
};

/**
* | output |
* | --- |
* | "Account offer changed" |
*
* @param {Audit_Event_Account_Offer_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_account_offer_changed = /** @type {((inputs?: Audit_Event_Account_Offer_ChangedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Account_Offer_ChangedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_account_offer_changed(inputs)
	return es_audit_event_account_offer_changed(inputs)
});