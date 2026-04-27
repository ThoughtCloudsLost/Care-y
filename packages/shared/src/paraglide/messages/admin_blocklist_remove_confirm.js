/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_Remove_ConfirmInputs */

const en_admin_blocklist_remove_confirm = /** @type {(inputs: Admin_Blocklist_Remove_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This number will no longer be blocked. Are you sure?`)
};

const es_admin_blocklist_remove_confirm = /** @type {(inputs: Admin_Blocklist_Remove_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este numero ya no estara bloqueado. Esta seguro?`)
};

/**
* | output |
* | --- |
* | "This number will no longer be blocked. Are you sure?" |
*
* @param {Admin_Blocklist_Remove_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_remove_confirm = /** @type {((inputs?: Admin_Blocklist_Remove_ConfirmInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_Remove_ConfirmInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_blocklist_remove_confirm(inputs)
	return es_admin_blocklist_remove_confirm(inputs)
});