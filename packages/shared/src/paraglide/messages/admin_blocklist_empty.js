/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_EmptyInputs */

const en_admin_blocklist_empty = /** @type {(inputs: Admin_Blocklist_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No blocked numbers yet.`)
};

const es_admin_blocklist_empty = /** @type {(inputs: Admin_Blocklist_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay numeros bloqueados.`)
};

/**
* | output |
* | --- |
* | "No blocked numbers yet." |
*
* @param {Admin_Blocklist_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_empty = /** @type {((inputs?: Admin_Blocklist_EmptyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_EmptyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_blocklist_empty(inputs)
	return es_admin_blocklist_empty(inputs)
});