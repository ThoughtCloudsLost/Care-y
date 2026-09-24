/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_Remove_TitleInputs */

const en_admin_blocklist_remove_title = /** @type {(inputs: Admin_Blocklist_Remove_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove blocked number`)
};

const es_admin_blocklist_remove_title = /** @type {(inputs: Admin_Blocklist_Remove_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar número bloqueado`)
};

const en_xa2_admin_blocklist_remove_title = /** @type {(inputs: Admin_Blocklist_Remove_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèmòvè blòckèd nùmbèr •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Remove blocked number" |
*
* @param {Admin_Blocklist_Remove_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_remove_title = /** @type {((inputs?: Admin_Blocklist_Remove_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_Remove_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_blocklist_remove_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_blocklist_remove_title(inputs)
	return en_admin_blocklist_remove_title(inputs)
});