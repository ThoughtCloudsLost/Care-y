/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Select_Mode_BodyInputs */

const en_demo_narrative_topic_select_mode_body = /** @type {(inputs: Demo_Narrative_Topic_Select_Mode_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select mode allows picking multiple tickets for batch actions.
**Available actions.** The bulk action bar appears above the ticket list with options that apply to all selected tickets. Actions depend on the volunteer's permissions.`)
};

const es_demo_narrative_topic_select_mode_body = /** @type {(inputs: Demo_Narrative_Topic_Select_Mode_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El modo de selección permite elegir varios tickets para acciones en lote.
**Acciones disponibles.** La barra de acciones masivas aparece encima de la lista de tickets con opciones que se aplican a todos los tickets seleccionados. Las acciones dependen de los permisos del voluntario.`)
};

const en_xa2_demo_narrative_topic_select_mode_body = /** @type {(inputs: Demo_Narrative_Topic_Select_Mode_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèlèct mòdè àllòws pìckìng mùltìplè tìckèts fòr bàtch àctìòns.
 •••••••••••••••••••**Àvàìlàblè àctìòns. ••••••** Thè bùlk àctìòn bàr àppèàrs àbòvè thè tìckèt lìst wìth òptìòns thàt àpply tò àll sèlèctèd tìckèts. Àctìòns dèpènd òn thè vòlùntèèr's pèrmìssìòns. ••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Select mode allows picking multiple tickets for batch actions. **Available actions.** The bulk action bar appears above the ticket list with options that app..." |
*
* @param {Demo_Narrative_Topic_Select_Mode_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_select_mode_body = /** @type {((inputs?: Demo_Narrative_Topic_Select_Mode_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Select_Mode_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_select_mode_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_select_mode_body(inputs)
	return en_demo_narrative_topic_select_mode_body(inputs)
});