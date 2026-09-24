/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_Add_TitleInputs */

const en_admin_blocklist_add_title = /** @type {(inputs: Admin_Blocklist_Add_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Block Number`)
};

const es_admin_blocklist_add_title = /** @type {(inputs: Admin_Blocklist_Add_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bloquear número`)
};

const en_xa2_admin_blocklist_add_title = /** @type {(inputs: Admin_Blocklist_Add_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Blòck Nùmbèr ••••⟧`)
};

/**
* | output |
* | --- |
* | "Block Number" |
*
* @param {Admin_Blocklist_Add_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_add_title = /** @type {((inputs?: Admin_Blocklist_Add_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_Add_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_blocklist_add_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_blocklist_add_title(inputs)
	return en_admin_blocklist_add_title(inputs)
});