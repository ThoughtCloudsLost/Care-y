/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Member_RemovedInputs */

const en_admin_queue_member_removed = /** @type {(inputs: Admin_Queue_Member_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Member removed`)
};

const es_admin_queue_member_removed = /** @type {(inputs: Admin_Queue_Member_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Miembro eliminado`)
};

/**
* | output |
* | --- |
* | "Member removed" |
*
* @param {Admin_Queue_Member_RemovedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_member_removed = /** @type {((inputs?: Admin_Queue_Member_RemovedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Member_RemovedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_member_removed(inputs)
	return es_admin_queue_member_removed(inputs)
});