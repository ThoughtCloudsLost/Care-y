/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Event_Merge_CompletedInputs */

const en_notif_event_merge_completed = /** @type {(inputs: Notif_Event_Merge_CompletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Merge done`)
};

const es_notif_event_merge_completed = /** @type {(inputs: Notif_Event_Merge_CompletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fusión completada`)
};

const en_xa2_notif_event_merge_completed = /** @type {(inputs: Notif_Event_Merge_CompletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mèrgè dònè •••⟧`)
};

/**
* | output |
* | --- |
* | "Merge done" |
*
* @param {Notif_Event_Merge_CompletedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_event_merge_completed = /** @type {((inputs?: Notif_Event_Merge_CompletedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Event_Merge_CompletedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_event_merge_completed(inputs)
	if (locale === "en-XA") return en_xa2_notif_event_merge_completed(inputs)
	return en_notif_event_merge_completed(inputs)
});