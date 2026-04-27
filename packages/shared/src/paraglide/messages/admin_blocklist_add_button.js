/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_Add_ButtonInputs */

const en_admin_blocklist_add_button = /** @type {(inputs: Admin_Blocklist_Add_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add blocked number`)
};

const es_admin_blocklist_add_button = /** @type {(inputs: Admin_Blocklist_Add_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar numero bloqueado`)
};

/**
* | output |
* | --- |
* | "Add blocked number" |
*
* @param {Admin_Blocklist_Add_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_add_button = /** @type {((inputs?: Admin_Blocklist_Add_ButtonInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_Add_ButtonInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_blocklist_add_button(inputs)
	return es_admin_blocklist_add_button(inputs)
});