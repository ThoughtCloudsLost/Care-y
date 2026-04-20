/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_AddedInputs */

const en_admin_blocklist_added = /** @type {(inputs: Admin_Blocklist_AddedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Number blocked`)
};

const es_admin_blocklist_added = /** @type {(inputs: Admin_Blocklist_AddedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Numero bloqueado`)
};

/**
* | output |
* | --- |
* | "Number blocked" |
*
* @param {Admin_Blocklist_AddedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_added = /** @type {((inputs?: Admin_Blocklist_AddedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_AddedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_blocklist_added(inputs)
	return es_admin_blocklist_added(inputs)
});