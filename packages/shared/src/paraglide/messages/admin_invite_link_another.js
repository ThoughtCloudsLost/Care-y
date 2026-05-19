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

/**
* | output |
* | --- |
* | "Generate Another" |
*
* @param {Admin_Invite_Link_AnotherInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_another = /** @type {((inputs?: Admin_Invite_Link_AnotherInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Link_AnotherInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_link_another(inputs)
	return es_admin_invite_link_another(inputs)
});