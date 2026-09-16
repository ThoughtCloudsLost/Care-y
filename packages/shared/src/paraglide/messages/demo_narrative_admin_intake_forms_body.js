/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Intake_Forms_BodyInputs */

const en_demo_narrative_admin_intake_forms_body = /** @type {(inputs: Demo_Narrative_Admin_Intake_Forms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The intake forms section lists every form the organization has created. Web intake can be switched on or off for the whole organization, and when it is on and no custom form is marked as default, a default form appears so intake always has something to serve.
**Permissions.** The Manage intake forms permission is a manager default, and the View intake responses permission is an administrator default. The two are independent and either can be granted to the other role, so a user who builds and publishes a form cannot read any responses to it unless the organization also grants the View intake responses permission.
**Encryption.** Form definitions are encrypted under a key derived from the organization's public key, so the intake page reads a form without an account while a database dump stays opaque. Duplicate produces a new encrypted copy with fresh field keys and a cleared slug so the copy cannot collide on a public URL.
**Lifecycle.** Creating a form does not publish it. A created form stays unreachable until it is activated, and deactivating it later stops submissions without deleting the form or its responses.`)
};

const es_demo_narrative_admin_intake_forms_body = /** @type {(inputs: Demo_Narrative_Admin_Intake_Forms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La sección de formularios de admisión lista todos los formularios que la organización ha creado. La admisión web se puede activar o desactivar para toda la organización, y cuando está activa y ningún formulario personalizado está marcado como predeterminado, aparece un formulario predeterminado para que la admisión siempre tenga algo que servir.
**Permisos.** El permiso Crear formularios de ingreso públicos es un valor predeterminado de gestor, y el permiso Leer respuestas de ingreso de todas las colas es un valor predeterminado de administrador. Los dos son independientes y cualquiera puede otorgarse al otro rol, de modo que una persona que construye y publica un formulario no puede leer ninguna de sus respuestas a menos que la organización también le otorgue el permiso Leer respuestas de ingreso de todas las colas.
**Cifrado.** Las definiciones de formulario se cifran con una clave derivada de la clave pública de la organización, de modo que la página de admisión lee un formulario sin cuenta mientras que un volcado de base de datos permanece opaco. Duplicar produce una nueva copia cifrada con claves de campo nuevas y un slug vacío para que la copia no colisione en una URL pública.
**Ciclo de vida.** Crear un formulario no lo publica. Un formulario creado permanece inaccesible hasta que se activa, y desactivarlo después detiene los envíos sin eliminar el formulario ni sus respuestas.`)
};

/**
* | output |
* | --- |
* | "The intake forms section lists every form the organization has created. Web intake can be switched on or off for the whole organization, and when it is on an..." |
*
* @param {Demo_Narrative_Admin_Intake_Forms_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_intake_forms_body = /** @type {((inputs?: Demo_Narrative_Admin_Intake_Forms_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Intake_Forms_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_intake_forms_body(inputs)
	return en_demo_narrative_admin_intake_forms_body(inputs)
});