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

const en_xa2_notif_queue_overrides_title = /** @type {(inputs: Notif_Queue_Overrides_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Qùèùè òvèrrìdès •••••⟧`)
};

/**
* | output |
* | --- |
* | "Queue overrides" |
*
* @param {Notif_Queue_Overrides_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_queue_overrides_title = /** @type {((inputs?: Notif_Queue_Overrides_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Queue_Overrides_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_queue_overrides_title(inputs)
	if (locale === "en-XA") return en_xa2_notif_queue_overrides_title(inputs)
	return en_notif_queue_overrides_title(inputs)
});