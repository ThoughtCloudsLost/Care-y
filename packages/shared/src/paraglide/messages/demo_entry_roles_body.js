/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Roles_BodyInputs */

const en_demo_entry_roles_body = /** @type {(inputs: Demo_Entry_Roles_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The user badge at the right end of the toolbar opens a dropdown to switch between Admin, Manager, and Volunteer accounts, and switching changes what every screen shows and what actions are available. The permission enforcement behind this is real server middleware running in your browser, so each role sees exactly what it would in production.`)
};

const es_demo_entry_roles_body = /** @type {(inputs: Demo_Entry_Roles_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La insignia de usuario en el extremo derecho de la barra de herramientas abre un menú desplegable para alternar entre cuentas de Administrador, Gestor y Voluntario, y cambiar de usuario modifica lo que muestra cada pantalla y las acciones disponibles. La aplicación de permisos detrás de esto es middleware de servidor real ejecutándose en tu navegador, así que cada rol ve exactamente lo que vería en producción.`)
};

/**
* | output |
* | --- |
* | "The user badge at the right end of the toolbar opens a dropdown to switch between Admin, Manager, and Volunteer accounts, and switching changes what every sc..." |
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