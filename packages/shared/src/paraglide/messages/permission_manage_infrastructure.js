/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_InfrastructureInputs */

const en_permission_manage_infrastructure = /** @type {(inputs: Permission_Manage_InfrastructureInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage infrastructure`)
};

const es_permission_manage_infrastructure = /** @type {(inputs: Permission_Manage_InfrastructureInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestionar infraestructura`)
};

const en_xa2_permission_manage_infrastructure = /** @type {(inputs: Permission_Manage_InfrastructureInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mànàgè ìnfràstrùctùrè •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Manage infrastructure" |
*
* @param {Permission_Manage_InfrastructureInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_infrastructure = /** @type {((inputs?: Permission_Manage_InfrastructureInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_InfrastructureInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_infrastructure(inputs)
	if (locale === "en-XA") return en_xa2_permission_manage_infrastructure(inputs)
	return en_permission_manage_infrastructure(inputs)
});