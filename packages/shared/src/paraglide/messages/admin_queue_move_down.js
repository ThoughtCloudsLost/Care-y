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

const en_xa2_admin_queue_move_down = /** @type {(inputs: Admin_Queue_Move_DownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mòvè dòwn •••⟧`)
};

/**
* | output |
* | --- |
* | "Move down" |
*
* @param {Admin_Queue_Move_DownInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_move_down = /** @type {((inputs?: Admin_Queue_Move_DownInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Move_DownInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_move_down(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_move_down(inputs)
	return en_admin_queue_move_down(inputs)
});