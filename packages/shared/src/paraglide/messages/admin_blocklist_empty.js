/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_EmptyInputs */

const en_admin_blocklist_empty = /** @type {(inputs: Admin_Blocklist_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No blocked numbers yet.`)
};

const es_admin_blocklist_empty = /** @type {(inputs: Admin_Blocklist_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay números bloqueados.`)
};

const en_xa2_admin_blocklist_empty = /** @type {(inputs: Admin_Blocklist_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò blòckèd nùmbèrs yèt. •••••••⟧`)
};

/**
* | output |
* | --- |
* | "No blocked numbers yet." |
*
* @param {Admin_Blocklist_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_empty = /** @type {((inputs?: Admin_Blocklist_EmptyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_EmptyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_blocklist_empty(inputs)
	if (locale === "en-XA") return en_xa2_admin_blocklist_empty(inputs)
	return en_admin_blocklist_empty(inputs)
});