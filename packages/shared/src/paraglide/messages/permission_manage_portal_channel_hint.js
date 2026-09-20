/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_Portal_Channel_HintInputs */

const en_permission_manage_portal_channel_hint = /** @type {(inputs: Permission_Manage_Portal_Channel_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Controls whether a client can access the secure portal for their case.`)
};

const es_permission_manage_portal_channel_hint = /** @type {(inputs: Permission_Manage_Portal_Channel_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Controla si un cliente puede acceder al portal seguro de su caso.`)
};

const en_xa2_permission_manage_portal_channel_hint = /** @type {(inputs: Permission_Manage_Portal_Channel_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còntròls whèthèr à clìènt càn àccèss thè sècùrè pòrtàl fòr thèìr càsè. •••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Controls whether a client can access the secure portal for their case." |
*
* @param {Permission_Manage_Portal_Channel_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_portal_channel_hint = /** @type {((inputs?: Permission_Manage_Portal_Channel_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_Portal_Channel_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_portal_channel_hint(inputs)
	if (locale === "en-XA") return en_xa2_permission_manage_portal_channel_hint(inputs)
	return en_permission_manage_portal_channel_hint(inputs)
});