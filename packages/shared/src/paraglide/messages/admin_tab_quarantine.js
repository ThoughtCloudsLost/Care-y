/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_QuarantineInputs */

const en_admin_tab_quarantine = /** @type {(inputs: Admin_Tab_QuarantineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unrouted`)
};

const es_admin_tab_quarantine = /** @type {(inputs: Admin_Tab_QuarantineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin ruta`)
};

const en_xa2_admin_tab_quarantine = /** @type {(inputs: Admin_Tab_QuarantineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnròùtèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Unrouted" |
*
* @param {Admin_Tab_QuarantineInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_tab_quarantine = /** @type {((inputs?: Admin_Tab_QuarantineInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_QuarantineInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_tab_quarantine(inputs)
	if (locale === "en-XA") return en_xa2_admin_tab_quarantine(inputs)
	return en_admin_tab_quarantine(inputs)
});