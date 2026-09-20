/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Event_Followup_AddedInputs */

const en_notif_event_followup_added = /** @type {(inputs: Notif_Event_Followup_AddedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New reply`)
};

const es_notif_event_followup_added = /** @type {(inputs: Notif_Event_Followup_AddedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nueva respuesta`)
};

const en_xa2_notif_event_followup_added = /** @type {(inputs: Notif_Event_Followup_AddedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèw rèply •••⟧`)
};

/**
* | output |
* | --- |
* | "New reply" |
*
* @param {Notif_Event_Followup_AddedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_event_followup_added = /** @type {((inputs?: Notif_Event_Followup_AddedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Event_Followup_AddedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_event_followup_added(inputs)
	if (locale === "en-XA") return en_xa2_notif_event_followup_added(inputs)
	return en_notif_event_followup_added(inputs)
});