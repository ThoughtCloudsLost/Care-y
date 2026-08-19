/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Roles_BodyInputs */

const en_demo_entry_roles_body = /** @type {(inputs: Demo_Entry_Roles_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The three user icons on the left side switch between Admin, Manager, and Volunteer accounts, and switching changes what every screen shows and what actions are available. The permission enforcement behind this is real server middleware running in your browser.`)
};

const es_demo_entry_roles_body = /** @type {(inputs: Demo_Entry_Roles_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los tres iconos de usuario en el lado izquierdo alternan entre cuentas de Administrador, Gestor y Voluntario, y cambiar de usuario modifica lo que muestra cada pantalla y las acciones disponibles. La aplicación de permisos detrás de esto es middleware de servidor real ejecutándose en tu navegador.`)
};

/**
* | output |
* | --- |
* | "The three user icons on the left side switch between Admin, Manager, and Volunteer accounts, and switching changes what every screen shows and what actions a..." |
*
* @param {Demo_Entry_Roles_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_roles_body = /** @type {((inputs?: Demo_Entry_Roles_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_Roles_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_entry_roles_body(inputs)
	return es_demo_entry_roles_body(inputs)
});