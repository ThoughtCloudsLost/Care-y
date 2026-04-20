/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_RemovedInputs */

const en_admin_blocklist_removed = /** @type {(inputs: Admin_Blocklist_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Number unblocked`)
};

const es_admin_blocklist_removed = /** @type {(inputs: Admin_Blocklist_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Numero desbloqueado`)
};

/**
* | output |
* | --- |
* | "Number unblocked" |
*
* @param {Admin_Blocklist_RemovedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_removed = /** @type {((inputs?: Admin_Blocklist_RemovedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_RemovedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_blocklist_removed(inputs)
	return es_admin_blocklist_removed(inputs)
});