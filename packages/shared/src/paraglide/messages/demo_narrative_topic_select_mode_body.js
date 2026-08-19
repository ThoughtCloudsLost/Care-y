/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Select_Mode_BodyInputs */

const en_demo_narrative_topic_select_mode_body = /** @type {(inputs: Demo_Narrative_Topic_Select_Mode_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select mode lets volunteers pick multiple tickets for batch actions. Tap the select button in the toolbar to enter selection mode, then tap tickets to add them to the selection.
**Available actions.** The bulk action bar appears at the bottom of the screen with options that apply to all selected tickets. Actions depend on the volunteer's permissions.
**Privacy.** Selection state is purely local. The server does not know which tickets are selected or why.`)
};

const es_demo_narrative_topic_select_mode_body = /** @type {(inputs: Demo_Narrative_Topic_Select_Mode_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El modo de selección permite a los voluntarios elegir varios tickets para acciones en lote. Toca el botón de selección en la barra de herramientas para entrar en modo de selección, luego toca los tickets para agregarlos a la selección.
**Acciones disponibles.** La barra de acciones masivas aparece en la parte inferior de la pantalla con opciones que se aplican a todos los tickets seleccionados. Las acciones dependen de los permisos del voluntario.
**Privacidad.** El estado de selección es puramente local. El servidor no sabe cuáles tickets están seleccionados ni por qué.`)
};

/**
* | output |
* | --- |
* | "Select mode lets volunteers pick multiple tickets for batch actions. Tap the select button in the toolbar to enter selection mode, then tap tickets to add th..." |
*
* @param {Demo_Narrative_Topic_Select_Mode_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_select_mode_body = /** @type {((inputs?: Demo_Narrative_Topic_Select_Mode_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Select_Mode_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_select_mode_body(inputs)
	return es_demo_narrative_topic_select_mode_body(inputs)
});