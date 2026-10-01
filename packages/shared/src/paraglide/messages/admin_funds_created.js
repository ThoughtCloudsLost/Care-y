/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Funds_CreatedInputs */

const en_admin_funds_created = /** @type {(inputs: Admin_Funds_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fund created`)
};

const es_admin_funds_created = /** @type {(inputs: Admin_Funds_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fondo creado`)
};

const en_xa2_admin_funds_created = /** @type {(inputs: Admin_Funds_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fùnd crèàtèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Fund created" |
*
* @param {Admin_Funds_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_created = /** @type {((inputs?: Admin_Funds_CreatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Funds_CreatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_funds_created(inputs)
	if (locale === "en-XA") return en_xa2_admin_funds_created(inputs)
	return en_admin_funds_created(inputs)
});