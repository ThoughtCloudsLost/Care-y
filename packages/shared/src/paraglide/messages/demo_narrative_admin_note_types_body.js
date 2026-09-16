/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Note_Types_BodyInputs */

const en_demo_narrative_admin_note_types_body = /** @type {(inputs: Demo_Narrative_Admin_Note_Types_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The note types section holds two groups. The first is the configurable types the organization defines, each carrying a name, icon, and optional description encrypted under the organization key, and the second is a set of eight system types listed with their descriptions.
**Escalation.** Each configurable type has three independent escalation toggles that control who is notified when a note of that type is written, plus a toggle that makes the type required when closing a ticket.
**Defaults.** The four types seeded with a new organization are ordinary configurable types the organization can edit or remove. Comment is set as the default, and Resolution is required when closing a ticket. Safety Concern and Request both escalate to administrators, managers, and everyone with access to the ticket, while Comment and Resolution notify only those with ticket access.
**Visibility.** Each type sets a minimum role for viewing and a minimum role for creating, so an organization can restrict sensitive note categories to managers or administrators.
**Persistence.** Retiring a type does not delete it, and a type cannot be deactivated while it is set as the organization default.
**Permissions.** Configuring note types requires the Manage note types permission.`)
};

const es_demo_narrative_admin_note_types_body = /** @type {(inputs: Demo_Narrative_Admin_Note_Types_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La sección de tipos de nota contiene dos grupos. El primero son los tipos configurables que define la organización, cada uno con un nombre, icono y descripción opcional cifrados con la clave de la organización, y el segundo es un conjunto de ocho tipos de sistema listados con sus descripciones.
**Escalamiento.** Cada tipo configurable tiene tres alternancias de escalamiento independientes que controlan quién recibe notificación cuando se escribe una nota de ese tipo, más una alternancia que hace obligatorio el tipo al cerrar un ticket.
**Valores predeterminados.** Los cuatro tipos que se crean con una organización nueva son tipos configurables ordinarios que la organización puede editar o eliminar. Comentario se establece como el predeterminado, y Resolución es obligatorio al cerrar un ticket. Preocupación de Seguridad y Solicitud escalan a administradores, gestores y todas las personas con acceso al ticket, mientras que Comentario y Resolución notifican solo a quienes tienen acceso al ticket.
**Visibilidad.** Cada tipo establece un rol mínimo para visualizar y un rol mínimo para crear, de modo que una organización puede restringir categorías sensibles de notas a gestores o administradores.
**Persistencia.** Retirar un tipo no lo elimina, y un tipo no se puede desactivar mientras esté configurado como el predeterminado de la organización.
**Permisos.** Configurar tipos de nota requiere el permiso Definir los tipos de notas que se pueden escribir.`)
};

/**
* | output |
* | --- |
* | "The note types section holds two groups. The first is the configurable types the organization defines, each carrying a name, icon, and optional description e..." |
*
* @param {Demo_Narrative_Admin_Note_Types_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_note_types_body = /** @type {((inputs?: Demo_Narrative_Admin_Note_Types_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Note_Types_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_note_types_body(inputs)
	return en_demo_narrative_admin_note_types_body(inputs)
});