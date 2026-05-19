/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Link_TitleInputs */

const en_admin_invite_link_title = /** @type {(inputs: Admin_Invite_Link_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invite with Link`)
};

const es_admin_invite_link_title = /** @type {(inputs: Admin_Invite_Link_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invitar con enlace`)
};

/**
* | output |
* | --- |
* | "Invite with Link" |
*
* @param {Admin_Invite_Link_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_title = /** @type {((inputs?: Admin_Invite_Link_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Link_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_link_title(inputs)
	return es_admin_invite_link_title(inputs)
});