/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Link_AnotherInputs */

const en_admin_invite_link_another = /** @type {(inputs: Admin_Invite_Link_AnotherInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generate Another`)
};

const es_admin_invite_link_another = /** @type {(inputs: Admin_Invite_Link_AnotherInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generar otro`)
};

const en_xa2_admin_invite_link_another = /** @type {(inputs: Admin_Invite_Link_AnotherInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Gènèràtè Ànòthèr •••••⟧`)
};

/**
* | output |
* | --- |
* | "Generate Another" |
*
* @param {Admin_Invite_Link_AnotherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_another = /** @type {((inputs?: Admin_Invite_Link_AnotherInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Link_AnotherInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_link_another(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_link_another(inputs)
	return en_admin_invite_link_another(inputs)
});