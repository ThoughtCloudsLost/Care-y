/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_PlaceholderInputs */

const en_admin_blocklist_placeholder = /** @type {(inputs: Admin_Blocklist_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Coming in a future update`)
};

const es_admin_blocklist_placeholder = /** @type {(inputs: Admin_Blocklist_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Disponible en una futura actualización`)
};

const en_xa2_admin_blocklist_placeholder = /** @type {(inputs: Admin_Blocklist_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còmìng ìn à fùtùrè ùpdàtè ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Coming in a future update" |
*
* @param {Admin_Blocklist_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_placeholder = /** @type {((inputs?: Admin_Blocklist_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_blocklist_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_admin_blocklist_placeholder(inputs)
	return en_admin_blocklist_placeholder(inputs)
});