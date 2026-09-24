/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_Remove_ButtonInputs */

const en_admin_blocklist_remove_button = /** @type {(inputs: Admin_Blocklist_Remove_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove`)
};

const es_admin_blocklist_remove_button = /** @type {(inputs: Admin_Blocklist_Remove_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar`)
};

const en_xa2_admin_blocklist_remove_button = /** @type {(inputs: Admin_Blocklist_Remove_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèmòvè ••⟧`)
};

/**
* | output |
* | --- |
* | "Remove" |
*
* @param {Admin_Blocklist_Remove_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_remove_button = /** @type {((inputs?: Admin_Blocklist_Remove_ButtonInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_Remove_ButtonInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_blocklist_remove_button(inputs)
	if (locale === "en-XA") return en_xa2_admin_blocklist_remove_button(inputs)
	return en_admin_blocklist_remove_button(inputs)
});