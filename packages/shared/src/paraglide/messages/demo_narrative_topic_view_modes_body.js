/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_View_Modes_BodyInputs */

const en_demo_narrative_topic_view_modes_body = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Switch between compact rows, cards, grid, table, or kanban. The layout changes how tickets are displayed but not what is decrypted. Your browser decrypts each visible card title on demand.`)
};

const es_demo_narrative_topic_view_modes_body = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambia entre filas compactas, tarjetas, cuadricula, tabla o kanban. El modo de vista cambia la presentacion pero no lo que se descifra. Tu navegador descifra el titulo de cada tarjeta visible bajo demanda.`)
};

/**
* | output |
* | --- |
* | "Switch between compact rows, cards, grid, table, or kanban. The layout changes how tickets are displayed but not what is decrypted. Your browser decrypts eac..." |
*
* @param {Demo_Narrative_Topic_View_Modes_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_view_modes_body = /** @type {((inputs?: Demo_Narrative_Topic_View_Modes_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_View_Modes_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_view_modes_body(inputs)
	return es_demo_narrative_topic_view_modes_body(inputs)
});