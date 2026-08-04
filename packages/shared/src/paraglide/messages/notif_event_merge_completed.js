/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Event_Merge_CompletedInputs */

const en_notif_event_merge_completed = /** @type {(inputs: Notif_Event_Merge_CompletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Merge done`)
};

const es_notif_event_merge_completed = /** @type {(inputs: Notif_Event_Merge_CompletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fusion completada`)
};

/**
* | output |
* | --- |
* | "Merge done" |
*
* @param {Notif_Event_Merge_CompletedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_event_merge_completed = /** @type {((inputs?: Notif_Event_Merge_CompletedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Event_Merge_CompletedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_event_merge_completed(inputs)
	return es_notif_event_merge_completed(inputs)
});