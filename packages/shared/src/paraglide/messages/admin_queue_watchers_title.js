/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Watchers_TitleInputs */

const en_admin_queue_watchers_title = /** @type {(inputs: Admin_Queue_Watchers_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Watchers`)
};

const es_admin_queue_watchers_title = /** @type {(inputs: Admin_Queue_Watchers_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Observadores`)
};

/**
* | output |
* | --- |
* | "Watchers" |
*
* @param {Admin_Queue_Watchers_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_watchers_title = /** @type {((inputs?: Admin_Queue_Watchers_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Watchers_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_watchers_title(inputs)
	return en_admin_queue_watchers_title(inputs)
});