/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Locked_ExplainerInputs */

const en_roles_locked_explainer = /** @type {(inputs: Roles_Locked_ExplainerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`These stay with Admin to protect keys and roles.`)
};

const es_roles_locked_explainer = /** @type {(inputs: Roles_Locked_ExplainerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estos permisos permanecen con Admin para proteger claves y roles.`)
};

/**
* | output |
* | --- |
* | "These stay with Admin to protect keys and roles." |
*
* @param {Roles_Locked_ExplainerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_locked_explainer = /** @type {((inputs?: Roles_Locked_ExplainerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Locked_ExplainerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_roles_locked_explainer(inputs)
	return es_roles_locked_explainer(inputs)
});