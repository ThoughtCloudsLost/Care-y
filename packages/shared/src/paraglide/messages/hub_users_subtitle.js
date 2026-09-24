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

const en_xa2_hub_users_subtitle = /** @type {(inputs: Hub_Users_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mànàgè ùsèrs, ròlès, ànd ìnvìtàtìòns •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Manage users, roles, and invitations" |
*
* @param {Hub_Users_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_users_subtitle = /** @type {((inputs?: Hub_Users_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Users_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_hub_users_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_hub_users_subtitle(inputs)
	return en_hub_users_subtitle(inputs)
});