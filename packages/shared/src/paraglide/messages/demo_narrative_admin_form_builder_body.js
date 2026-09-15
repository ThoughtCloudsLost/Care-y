/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Form_Builder_BodyInputs */

const en_demo_narrative_admin_form_builder_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Builder_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The field list shows every field on the form in order, with page breaks appearing as separator rows between the fields they divide.
**Removing.** Removing a field is immediate and has no confirmation dialog, but the change is not saved until the user saves the form.
**Field types.** The available field types are grouped into data fields and structural elements. Data fields collect answers from the visitor, while structural elements control layout without collecting data.
**Save and delete.** The save button saves the entire form and is disabled when no changes have been made, while the delete button opens a confirmation dialog.`)
};

const es_demo_narrative_admin_form_builder_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Builder_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La lista de campos muestra cada campo del formulario en orden, con los saltos de página apareciendo como filas separadoras entre los campos que dividen.
**Eliminar.** Eliminar un campo es inmediato y no tiene diálogo de confirmación, pero el cambio no se guarda hasta que el usuario guarda el formulario.
**Tipos de campo.** Los tipos de campo disponibles se agrupan en campos de datos y elementos estructurales. Los campos de datos recogen respuestas del visitante, mientras que los elementos estructurales controlan el diseño sin recoger datos.
**Guardar y eliminar.** El botón de guardar guarda todo el formulario y se deshabilita cuando no hay cambios, mientras que el botón de eliminar abre un diálogo de confirmación.`)
};

/**
* | output |
* | --- |
* | "The field list shows every field on the form in order, with page breaks appearing as separator rows between the fields they divide. **Removing.** Removing a ..." |
*
* @param {Demo_Narrative_Admin_Form_Builder_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_builder_body = /** @type {((inputs?: Demo_Narrative_Admin_Form_Builder_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Form_Builder_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_form_builder_body(inputs)
	return en_demo_narrative_admin_form_builder_body(inputs)
});