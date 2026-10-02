/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Donations_Connect_GivebutterInputs */

const en_admin_donations_connect_givebutter = /** @type {(inputs: Admin_Donations_Connect_GivebutterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Connect Givebutter`)
};

const es_admin_donations_connect_givebutter = /** @type {(inputs: Admin_Donations_Connect_GivebutterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Conectar Givebutter`)
};

const en_xa2_admin_donations_connect_givebutter = /** @type {(inputs: Admin_Donations_Connect_GivebutterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cònnèct Gìvèbùttèr ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Connect Givebutter" |
*
* @param {Admin_Donations_Connect_GivebutterInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_connect_givebutter = /** @type {((inputs?: Admin_Donations_Connect_GivebutterInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Donations_Connect_GivebutterInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_donations_connect_givebutter(inputs)
	if (locale === "en-XA") return en_xa2_admin_donations_connect_givebutter(inputs)
	return en_admin_donations_connect_givebutter(inputs)
});