/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Role_Admin_TooltipInputs */

const en_demo_role_admin_tooltip = /** @type {(inputs: Demo_Role_Admin_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Admin with full access to all features. Switch users to see how server side enforcement changes every screen.`)
};

const es_demo_role_admin_tooltip = /** @type {(inputs: Demo_Role_Admin_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administrador con acceso completo a todas las funciones. Cambia de usuario para ver como la autorizacion del servidor cambia cada pantalla.`)
};

/**
* | output |
* | --- |
* | "Admin with full access to all features. Switch users to see how server side enforcement changes every screen." |
*
* @param {Demo_Role_Admin_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_role_admin_tooltip = /** @type {((inputs?: Demo_Role_Admin_TooltipInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Role_Admin_TooltipInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_role_admin_tooltip(inputs)
	return es_demo_role_admin_tooltip(inputs)
});