/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Users_SubtitleInputs */

const en_hub_users_subtitle = /** @type {(inputs: Hub_Users_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage users, roles, and invitations`)
};

const es_hub_users_subtitle = /** @type {(inputs: Hub_Users_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administrar usuarios, roles e invitaciones`)
};

/**
* | output |
* | --- |
* | "Manage users, roles, and invitations" |
*
* @param {Hub_Users_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_users_subtitle = /** @type {((inputs?: Hub_Users_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Users_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_hub_users_subtitle(inputs)
	return es_hub_users_subtitle(inputs)
});