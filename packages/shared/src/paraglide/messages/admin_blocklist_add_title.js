/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_Add_TitleInputs */

const en_admin_blocklist_add_title = /** @type {(inputs: Admin_Blocklist_Add_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Block Number`)
};

const es_admin_blocklist_add_title = /** @type {(inputs: Admin_Blocklist_Add_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bloquear numero`)
};

/**
* | output |
* | --- |
* | "Block Number" |
*
* @param {Admin_Blocklist_Add_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_add_title = /** @type {((inputs?: Admin_Blocklist_Add_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_Add_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_blocklist_add_title(inputs)
	return es_admin_blocklist_add_title(inputs)
});