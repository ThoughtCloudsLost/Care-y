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

const en_xa2_admin_tab_blocklist = /** @type {(inputs: Admin_Tab_BlocklistInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Blòcklìst •••⟧`)
};

/**
* | output |
* | --- |
* | "Blocklist" |
*
* @param {Admin_Tab_BlocklistInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_tab_blocklist = /** @type {((inputs?: Admin_Tab_BlocklistInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_BlocklistInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_tab_blocklist(inputs)
	if (locale === "en-XA") return en_xa2_admin_tab_blocklist(inputs)
	return en_admin_tab_blocklist(inputs)
});