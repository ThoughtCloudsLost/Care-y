/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Move_UpInputs */

const en_admin_queue_move_up = /** @type {(inputs: Admin_Queue_Move_UpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Move up`)
};

const es_admin_queue_move_up = /** @type {(inputs: Admin_Queue_Move_UpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Subir`)
};

/**
* | output |
* | --- |
* | "Move up" |
*
* @param {Admin_Queue_Move_UpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_move_up = /** @type {((inputs?: Admin_Queue_Move_UpInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Move_UpInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_move_up(inputs)
	return es_admin_queue_move_up(inputs)
});