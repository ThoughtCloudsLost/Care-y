/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Select_Mode_BodyInputs */

const en_demo_narrative_topic_select_mode_body = /** @type {(inputs: Demo_Narrative_Topic_Select_Mode_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select multiple tickets or messages to perform batch actions. Selection state is purely local. The server never learns which items you selected or why.`)
};

const es_demo_narrative_topic_select_mode_body = /** @type {(inputs: Demo_Narrative_Topic_Select_Mode_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Selecciona varios tickets o mensajes para realizar acciones en lote. El estado de seleccion es puramente local. El servidor nunca sabe cuales elementos seleccionaste ni por que.`)
};

/**
* | output |
* | --- |
* | "Select multiple tickets or messages to perform batch actions. Selection state is purely local. The server never learns which items you selected or why." |
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