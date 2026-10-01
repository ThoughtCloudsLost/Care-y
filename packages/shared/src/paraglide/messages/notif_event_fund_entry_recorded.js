/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Event_Fund_Entry_RecordedInputs */

const en_notif_event_fund_entry_recorded = /** @type {(inputs: Notif_Event_Fund_Entry_RecordedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fund entries`)
};

const es_notif_event_fund_entry_recorded = /** @type {(inputs: Notif_Event_Fund_Entry_RecordedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Movimientos de fondos`)
};

const en_xa2_notif_event_fund_entry_recorded = /** @type {(inputs: Notif_Event_Fund_Entry_RecordedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fùnd èntrìès ••••⟧`)
};

/**
* | output |
* | --- |
* | "Fund entries" |
*
* @param {Notif_Event_Fund_Entry_RecordedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_event_fund_entry_recorded = /** @type {((inputs?: Notif_Event_Fund_Entry_RecordedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Event_Fund_Entry_RecordedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_event_fund_entry_recorded(inputs)
	if (locale === "en-XA") return en_xa2_notif_event_fund_entry_recorded(inputs)
	return en_notif_event_fund_entry_recorded(inputs)
});