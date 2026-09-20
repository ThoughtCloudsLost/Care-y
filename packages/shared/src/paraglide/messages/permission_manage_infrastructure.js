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

/**
* | output |
* | --- |
* | "Manage infrastructure" |
*
* @param {Permission_Manage_InfrastructureInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_infrastructure = /** @type {((inputs?: Permission_Manage_InfrastructureInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_InfrastructureInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_infrastructure(inputs)
	return en_permission_manage_infrastructure(inputs)
});