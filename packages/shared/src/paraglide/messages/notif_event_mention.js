/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Event_MentionInputs */

const en_notif_event_mention = /** @type {(inputs: Notif_Event_MentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mention`)
};

const es_notif_event_mention = /** @type {(inputs: Notif_Event_MentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mención`)
};

const en_xa2_notif_event_mention = /** @type {(inputs: Notif_Event_MentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mèntìòn •••⟧`)
};

/**
* | output |
* | --- |
* | "Mention" |
*
* @param {Notif_Event_MentionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_event_mention = /** @type {((inputs?: Notif_Event_MentionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Event_MentionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_event_mention(inputs)
	if (locale === "en-XA") return en_xa2_notif_event_mention(inputs)
	return en_notif_event_mention(inputs)
});