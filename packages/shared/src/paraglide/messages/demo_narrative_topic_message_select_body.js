/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Message_Select_BodyInputs */

const en_demo_narrative_topic_message_select_body = /** @type {(inputs: Demo_Narrative_Topic_Message_Select_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The select button in the toolbar switches the thread into selection mode. Tapping messages adds them to the selection, and a select all option grabs the entire visible thread.
**Copy.** The selection bar copies the decrypted text of every selected message to the clipboard in one action, which is useful for handing a case summary to another volunteer or pasting into a note.
**Privacy.** Selection state and the copied text stay on the device, and the server does not know which messages were selected.`)
};

const es_demo_narrative_topic_message_select_body = /** @type {(inputs: Demo_Narrative_Topic_Message_Select_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El boton de seleccion en la barra de herramientas cambia el hilo al modo de seleccion. Tocar mensajes los agrega a la seleccion, y una opcion de seleccionar todo abarca el hilo visible completo.
**Copiar.** La barra de seleccion copia el texto descifrado de todos los mensajes seleccionados al portapapeles en una sola accion, lo cual es util para pasar un resumen del caso a otro voluntario o pegar en una nota.
**Privacidad.** El estado de seleccion y el texto copiado permanecen en el dispositivo, y el servidor no sabe cuales mensajes fueron seleccionados.`)
};

/**
* | output |
* | --- |
* | "The select button in the toolbar switches the thread into selection mode. Tapping messages adds them to the selection, and a select all option grabs the enti..." |
*
* @param {Demo_Narrative_Topic_Message_Select_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_message_select_body = /** @type {((inputs?: Demo_Narrative_Topic_Message_Select_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Message_Select_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_message_select_body(inputs)
	return es_demo_narrative_topic_message_select_body(inputs)
});