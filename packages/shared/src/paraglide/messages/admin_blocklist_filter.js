/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_FilterInputs */

const en_admin_blocklist_filter = /** @type {(inputs: Admin_Blocklist_FilterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filter blocked numbers...`)
};

const es_admin_blocklist_filter = /** @type {(inputs: Admin_Blocklist_FilterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filtrar números bloqueados...`)
};

const en_xa2_admin_blocklist_filter = /** @type {(inputs: Admin_Blocklist_FilterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìltèr blòckèd nùmbèrs... ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Filter blocked numbers..." |
*
* @param {Admin_Blocklist_FilterInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_filter = /** @type {((inputs?: Admin_Blocklist_FilterInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_FilterInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_blocklist_filter(inputs)
	if (locale === "en-XA") return en_xa2_admin_blocklist_filter(inputs)
	return en_admin_blocklist_filter(inputs)
});