/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Event_MentionInputs */

const en_notif_event_mention = /** @type {(inputs: Notif_Event_MentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mention`)
};

const es_notif_event_mention = /** @type {(inputs: Notif_Event_MentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mencion`)
};

/**
* | output |
* | --- |
* | "Mention" |
*
* @param {Notif_Event_MentionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_event_mention = /** @type {((inputs?: Notif_Event_MentionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Event_MentionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_event_mention(inputs)
	return es_notif_event_mention(inputs)
});