/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_BlocklistInputs */

const en_admin_tab_blocklist = /** @type {(inputs: Admin_Tab_BlocklistInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Blocklist`)
};

const es_admin_tab_blocklist = /** @type {(inputs: Admin_Tab_BlocklistInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lista de bloqueo`)
};

/**
* | output |
* | --- |
* | "Blocklist" |
*
* @param {Admin_Tab_BlocklistInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_blocklist = /** @type {((inputs?: Admin_Tab_BlocklistInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_BlocklistInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_tab_blocklist(inputs)
	return es_admin_tab_blocklist(inputs)
});