/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Move_DownInputs */

const en_admin_queue_move_down = /** @type {(inputs: Admin_Queue_Move_DownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Move down`)
};

const es_admin_queue_move_down = /** @type {(inputs: Admin_Queue_Move_DownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bajar`)
};

/**
* | output |
* | --- |
* | "Move down" |
*
* @param {Admin_Queue_Move_DownInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_move_down = /** @type {((inputs?: Admin_Queue_Move_DownInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Move_DownInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_move_down(inputs)
	return es_admin_queue_move_down(inputs)
});