/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_RemovedInputs */

const en_admin_blocklist_removed = /** @type {(inputs: Admin_Blocklist_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Number unblocked`)
};

const es_admin_blocklist_removed = /** @type {(inputs: Admin_Blocklist_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Número desbloqueado`)
};

const en_xa2_admin_blocklist_removed = /** @type {(inputs: Admin_Blocklist_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nùmbèr ùnblòckèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Number unblocked" |
*
* @param {Admin_Blocklist_RemovedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_removed = /** @type {((inputs?: Admin_Blocklist_RemovedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_RemovedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_blocklist_removed(inputs)
	if (locale === "en-XA") return en_xa2_admin_blocklist_removed(inputs)
	return en_admin_blocklist_removed(inputs)
});