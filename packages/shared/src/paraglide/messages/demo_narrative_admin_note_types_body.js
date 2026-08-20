/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Note_Types_BodyInputs */

const en_demo_narrative_admin_note_types_body = /** @type {(inputs: Demo_Narrative_Admin_Note_Types_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administrators create and configure the note types that volunteers use when writing internal notes on tickets.
**Configuration.** Each note type has a name, icon, description, minimum role for viewing, minimum role for creating, and escalation targets that control who is notified when a note of that type is written.
**Defaults.** The four default types are Comment, Resolution, Safety Concern, and Request. Administrators can add custom types for their organization's workflow.
**Close prompts.** Note types can be marked as required on close. When a volunteer closes a ticket, they are stepped through each required type and prompted to write a note, and each prompt can be skipped.`)
};

const es_demo_narrative_admin_note_types_body = /** @type {(inputs: Demo_Narrative_Admin_Note_Types_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los administradores crean y configuran los tipos de nota que los voluntarios usan al escribir notas internas en los tickets.
**Configuración.** Cada tipo de nota tiene un nombre, icono, descripción, rol mínimo para visualizar, rol mínimo para crear y objetivos de escalamiento que controlan quién recibe notificación cuando se escribe una nota de ese tipo.
**Predeterminados.** Los cuatro tipos predeterminados son Comentario, Resolución, Preocupación de Seguridad y Solicitud. Los administradores pueden añadir tipos personalizados para el flujo de trabajo de su organización.
**Solicitudes al cierre.** Los tipos de nota pueden marcarse como requeridos al cierre. Cuando un voluntario cierra un ticket, se le guía a través de cada tipo requerido y se le solicita escribir una nota, y cada solicitud se puede omitir.`)
};

/**
* | output |
* | --- |
* | "Administrators create and configure the note types that volunteers use when writing internal notes on tickets. **Configuration.** Each note type has a name, ..." |
*
* @param {Demo_Narrative_Admin_Note_Types_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_note_types_body = /** @type {((inputs?: Demo_Narrative_Admin_Note_Types_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Note_Types_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_note_types_body(inputs)
	return es_demo_narrative_admin_note_types_body(inputs)
});