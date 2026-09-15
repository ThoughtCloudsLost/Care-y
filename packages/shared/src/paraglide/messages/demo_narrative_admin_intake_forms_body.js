/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Intake_Forms_BodyInputs */

const en_demo_narrative_admin_intake_forms_body = /** @type {(inputs: Demo_Narrative_Admin_Intake_Forms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The intake forms section on the organization settings page lists every intake form the organization has created.
**Status.** Each row shows whether the form is active (accepting submissions) or a draft (not yet published). A new form starts as a draft and becomes visible to the public intake page only after an administrator publishes it. Published forms can be deactivated to stop accepting submissions without deleting the form.
**Queue.** The row also shows which queue the form feeds. Tickets created through a form land in that queue automatically.
**Opening the editor.** Tapping a form row opens the form builder with that form's fields loaded.`)
};

const es_demo_narrative_admin_intake_forms_body = /** @type {(inputs: Demo_Narrative_Admin_Intake_Forms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La sección de formularios de admisión en la página de configuración de la organización lista todos los formularios de admisión que la organización ha creado.
**Estado.** Cada fila muestra si el formulario está activo (aceptando envíos) o es un borrador (aún no publicado). Un formulario nuevo comienza como borrador y se vuelve visible en la página pública de admisión solo cuando un administrador lo publica. Los formularios publicados pueden desactivarse para dejar de aceptar envíos sin eliminar el formulario.
**Cola.** La fila también muestra qué cola alimenta el formulario. Los tickets creados a través de un formulario llegan a esa cola automáticamente.
**Abrir el editor.** Tocar una fila de formulario abre el constructor de formularios con los campos de ese formulario cargados.`)
};

/**
* | output |
* | --- |
* | "The intake forms section on the organization settings page lists every intake form the organization has created. **Status.** Each row shows whether the form ..." |
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