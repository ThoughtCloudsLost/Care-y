/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_EmptyInputs */

const en_admin_quarantine_empty = /** @type {(inputs: Admin_Quarantine_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No quarantined voicemails.`)
};

const es_admin_quarantine_empty = /** @type {(inputs: Admin_Quarantine_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay correos de voz en cuarentena.`)
};

/**
* | output |
* | --- |
* | "No quarantined voicemails." |
*
* @param {Admin_Quarantine_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_empty = /** @type {((inputs?: Admin_Quarantine_EmptyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_EmptyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_empty(inputs)
	return es_admin_quarantine_empty(inputs)
});