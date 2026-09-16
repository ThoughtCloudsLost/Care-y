/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Field_Config_BodyInputs */

const en_demo_narrative_admin_field_config_body = /** @type {(inputs: Demo_Narrative_Admin_Field_Config_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The field settings sheet controls the configuration for a single field, and its contents change with the field type. Every field has a label and optional help text for each locale and a required toggle. Text fields have a placeholder and maximum length, the two pick types have editable option lists, and the standalone checkbox has a toggle that requires the visitor to check it before submitting.
**Roles.** Ten roles tell the rest of the system what a field's answer means rather than leaving it an unlabeled string. Roles that identify a person, such as phone contact or real name, may appear at most once per form. The role and widget type are validated as a pair, and when a chosen role does not fit the current widget the sheet explains the conflict and offers the compatible widget as a correction.
**When it appears.** A field can be set to appear only when answers on earlier fields match specified values, expressed as groups of conditions.
**Persistence.** Changing the field type preserves the configuration of the type being left so switching back does not lose work, and clears only a role the new type cannot carry.`)
};

const es_demo_narrative_admin_field_config_body = /** @type {(inputs: Demo_Narrative_Admin_Field_Config_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La hoja de configuración de campo controla los ajustes de un campo individual, y su contenido cambia según el tipo de campo. Todos los campos tienen una etiqueta y un texto de ayuda opcional para cada idioma y una alternancia de obligatorio. Los campos de texto tienen marcador de posición y longitud máxima, los dos tipos de selección tienen listas de opciones editables, y la casilla de verificación individual tiene una alternancia que exige que el visitante la marque antes de enviar.
**Roles.** Diez roles le indican al resto del sistema qué significa la respuesta de un campo en lugar de dejarla como una cadena sin clasificar. Los roles que identifican a una persona, como teléfono de contacto o nombre real, pueden aparecer como máximo una vez por formulario. El rol y el tipo de control se validan como par, y cuando un rol elegido no es compatible con el control actual la hoja explica el conflicto y ofrece el control compatible como corrección.
**Cuándo aparece.** Un campo se puede configurar para que aparezca solo cuando las respuestas en campos anteriores coincidan con valores especificados, expresados como grupos de condiciones.
**Persistencia.** Cambiar el tipo de campo conserva la configuración del tipo que se deja para que volver no pierda trabajo, y solo borra un rol que el nuevo tipo no puede llevar.`)
};

/**
* | output |
* | --- |
* | "The field settings sheet controls the configuration for a single field, and its contents change with the field type. Every field has a label and optional hel..." |
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