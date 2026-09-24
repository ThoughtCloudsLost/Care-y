/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_Channel_RoutingInputs */

const en_permission_manage_channel_routing = /** @type {(inputs: Permission_Manage_Channel_RoutingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage channel routing`)
};

const es_permission_manage_channel_routing = /** @type {(inputs: Permission_Manage_Channel_RoutingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestionar enrutamiento de canales`)
};

const en_xa2_permission_manage_channel_routing = /** @type {(inputs: Permission_Manage_Channel_RoutingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mànàgè chànnèl ròùtìng •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Manage channel routing" |
*
* @param {Permission_Manage_Channel_RoutingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_channel_routing = /** @type {((inputs?: Permission_Manage_Channel_RoutingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_Channel_RoutingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_channel_routing(inputs)
	if (locale === "en-XA") return en_xa2_permission_manage_channel_routing(inputs)
	return en_permission_manage_channel_routing(inputs)
});