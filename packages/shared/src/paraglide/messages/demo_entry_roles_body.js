/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Roles_BodyInputs */

const en_demo_entry_roles_body = /** @type {(inputs: Demo_Entry_Roles_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The three user icons on the left side switch between Admin, Manager, and Volunteer accounts. Permission enforcement is real server middleware running in your browser. Switching users changes what every screen shows and what actions are available.`)
};

const es_demo_entry_roles_body = /** @type {(inputs: Demo_Entry_Roles_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los tres iconos de usuario en el lado izquierdo alternan entre cuentas de Administrador, Gestor y Voluntario. La aplicacion de permisos es middleware de servidor real ejecutandose en tu navegador. Cambiar de usuario modifica lo que muestra cada pantalla y las acciones disponibles.`)
};

/**
* | output |
* | --- |
* | "The three user icons on the left side switch between Admin, Manager, and Volunteer accounts. Permission enforcement is real server middleware running in your..." |
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