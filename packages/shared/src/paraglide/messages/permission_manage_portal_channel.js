/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_Portal_ChannelInputs */

const en_permission_manage_portal_channel = /** @type {(inputs: Permission_Manage_Portal_ChannelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage portal channel`)
};

const es_permission_manage_portal_channel = /** @type {(inputs: Permission_Manage_Portal_ChannelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestionar canal del portal`)
};

const en_xa2_permission_manage_portal_channel = /** @type {(inputs: Permission_Manage_Portal_ChannelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mànàgè pòrtàl chànnèl •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Manage portal channel" |
*
* @param {Permission_Manage_Portal_ChannelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_portal_channel = /** @type {((inputs?: Permission_Manage_Portal_ChannelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_Portal_ChannelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_portal_channel(inputs)
	if (locale === "en-XA") return en_xa2_permission_manage_portal_channel(inputs)
	return en_permission_manage_portal_channel(inputs)
});