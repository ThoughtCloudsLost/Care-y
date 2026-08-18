/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Saved_Filters_BodyInputs */

const en_demo_narrative_topic_saved_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Saved_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteers can save a combination of active filters as a named preset for reuse. Saved filters appear as quick access buttons above the filter pills.
**Persistence.** Saved filters are stored locally on the device. They are not shared with other volunteers or sent to the server.
**Colors.** Each saved filter can be assigned a color to make it visually distinct in the list of presets.`)
};

const es_demo_narrative_topic_saved_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Saved_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los voluntarios pueden guardar una combinacion de filtros activos como un preset nombrado para reutilizar. Los filtros guardados aparecen como botones de acceso rapido encima de las pastillas de filtro.
**Persistencia.** Los filtros guardados se almacenan localmente en el dispositivo. No se comparten con otros voluntarios ni se envian al servidor.
**Colores.** Cada filtro guardado puede tener un color asignado para distinguirlo visualmente en la lista de presets.`)
};

/**
* | output |
* | --- |
* | "Volunteers can save a combination of active filters as a named preset for reuse. Saved filters appear as quick access buttons above the filter pills. **Persi..." |
*
* @param {Demo_Narrative_Topic_Saved_Filters_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_saved_filters_body = /** @type {((inputs?: Demo_Narrative_Topic_Saved_Filters_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Saved_Filters_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_saved_filters_body(inputs)
	return es_demo_narrative_topic_saved_filters_body(inputs)
});