/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_EmptyInputs */

const en_admin_quarantine_empty = /** @type {(inputs: Admin_Quarantine_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No unrouted voicemails.`)
};

const es_admin_quarantine_empty = /** @type {(inputs: Admin_Quarantine_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay mensajes de voz sin ruta.`)
};

const en_xa2_admin_quarantine_empty = /** @type {(inputs: Admin_Quarantine_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò ùnròùtèd vòìcèmàìls. •••••••⟧`)
};

/**
* | output |
* | --- |
* | "No unrouted voicemails." |
*
* @param {Admin_Quarantine_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_empty = /** @type {((inputs?: Admin_Quarantine_EmptyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_EmptyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_quarantine_empty(inputs)
	if (locale === "en-XA") return en_xa2_admin_quarantine_empty(inputs)
	return en_admin_quarantine_empty(inputs)
});