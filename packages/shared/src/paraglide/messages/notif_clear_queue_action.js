/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Clear_Queue_ActionInputs */

const en_notif_clear_queue_action = /** @type {(inputs: Notif_Clear_Queue_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clear`)
};

const es_notif_clear_queue_action = /** @type {(inputs: Notif_Clear_Queue_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Borrar`)
};

const en_xa2_notif_clear_queue_action = /** @type {(inputs: Notif_Clear_Queue_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clèàr ••⟧`)
};

/**
* | output |
* | --- |
* | "Clear" |
*
* @param {Notif_Clear_Queue_ActionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_clear_queue_action = /** @type {((inputs?: Notif_Clear_Queue_ActionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Clear_Queue_ActionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_clear_queue_action(inputs)
	if (locale === "en-XA") return en_xa2_notif_clear_queue_action(inputs)
	return en_notif_clear_queue_action(inputs)
});