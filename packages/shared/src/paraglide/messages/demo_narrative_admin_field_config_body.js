/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Field_Config_BodyInputs */

const en_demo_narrative_admin_field_config_body = /** @type {(inputs: Demo_Narrative_Admin_Field_Config_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The field settings sheet controls the configuration for a single field, and its contents depend on the field type.
**Common settings.** Every field has a label, an optional help text, and a required toggle. The label and help text can be written in each locale by switching the locale selector above the editor.
**Conditional visibility.** A toggle lets the user make the field appear only when another field has a specific value. The condition source lists every earlier field whose type supports conditions, and when a condition is set the field row in the editor shows a chip with the dependency.
**Configuration.** Dropdown and checkboxes fields show an option list for adding, reordering, and removing choices. Text area fields show a maximum length setting, and a single checkbox field shows a must be checked toggle that requires the visitor to check the box before submitting.`)
};

const es_demo_narrative_admin_field_config_body = /** @type {(inputs: Demo_Narrative_Admin_Field_Config_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La hoja de configuración de campo controla los ajustes de un campo individual, y su contenido depende del tipo de campo.
**Configuración común.** Todos los campos tienen una etiqueta, un texto de ayuda opcional y una alternancia de obligatorio. La etiqueta y el texto de ayuda pueden escribirse en cada idioma cambiando el selector de idioma sobre el editor.
**Visibilidad condicional.** Una alternancia permite al usuario hacer que el campo aparezca solo cuando otro campo tiene un valor específico. La fuente de condición lista todos los campos anteriores cuyo tipo soporta condiciones, y cuando se establece una condición la fila del campo en el editor muestra una insignia con la dependencia.
**Configuración.** Los campos de tipo lista desplegable y casillas de verificación muestran una lista de opciones para añadir, reordenar y eliminar opciones. Los campos de tipo área de texto muestran una configuración de longitud máxima, y un campo de casilla de verificación individual muestra una alternancia de confirmación requerida que exige que el visitante marque la casilla antes de enviar.`)
};

/**
* | output |
* | --- |
* | "The field settings sheet controls the configuration for a single field, and its contents depend on the field type. **Common settings.** Every field has a lab..." |
*
* @param {Demo_Narrative_Admin_Field_Config_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_field_config_body = /** @type {((inputs?: Demo_Narrative_Admin_Field_Config_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Field_Config_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_field_config_body(inputs)
	return en_demo_narrative_admin_field_config_body(inputs)
});