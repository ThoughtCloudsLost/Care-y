/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Blocklist_Show_AllInputs */

const en_admin_blocklist_show_all = /** @type {(inputs: Admin_Blocklist_Show_AllInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Show ${i?.count} more`)
};

const es_admin_blocklist_show_all = /** @type {(inputs: Admin_Blocklist_Show_AllInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Mostrar ${i?.count} más`)
};

const en_xa2_admin_blocklist_show_all = /** @type {(inputs: Admin_Blocklist_Show_AllInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Shòw  ••${i?.count} mòrè ••⟧`)
};

/**
* | output |
* | --- |
* | "Show {count} more" |
*
* @param {Admin_Blocklist_Show_AllInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_show_all = /** @type {((inputs: Admin_Blocklist_Show_AllInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_Show_AllInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_blocklist_show_all(inputs)
	if (locale === "en-XA") return en_xa2_admin_blocklist_show_all(inputs)
	return en_admin_blocklist_show_all(inputs)
});