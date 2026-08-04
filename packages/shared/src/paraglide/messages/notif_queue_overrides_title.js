/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Queue_Overrides_TitleInputs */

const en_notif_queue_overrides_title = /** @type {(inputs: Notif_Queue_Overrides_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queue overrides`)
};

const es_notif_queue_overrides_title = /** @type {(inputs: Notif_Queue_Overrides_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Excepciones por cola`)
};

/**
* | output |
* | --- |
* | "Queue overrides" |
*
* @param {Notif_Queue_Overrides_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_queue_overrides_title = /** @type {((inputs?: Notif_Queue_Overrides_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Queue_Overrides_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_queue_overrides_title(inputs)
	return es_notif_queue_overrides_title(inputs)
});