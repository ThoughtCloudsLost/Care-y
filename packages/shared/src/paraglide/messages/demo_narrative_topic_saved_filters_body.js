/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Saved_Filters_BodyInputs */

const en_demo_narrative_topic_saved_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Saved_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A combination of active filters can be saved as a named preset for reuse. Saved filters appear as quick access buttons above the filter pills.
**Persistence.** Unshared filters are stored locally on the device and stay private to the volunteer. Sharing a filter stores it as encrypted data for the organization, a badge marks it as shared, and it becomes visible to teammates.
**Chip options.** Holding a saved filter chip opens its options, where the filter can be deleted or shared.`)
};

const es_demo_narrative_topic_saved_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Saved_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una combinación de filtros activos se puede guardar como un preset nombrado para reutilizar. Los filtros guardados aparecen como botones de acceso rápido encima de las pastillas de filtro.
**Persistencia.** Los filtros no compartidos se almacenan localmente en el dispositivo y permanecen privados para el voluntario. Compartir un filtro lo almacena como datos cifrados para la organización, una insignia lo marca como compartido y queda visible para el resto del equipo.
**Opciones del chip.** Mantener pulsado un chip de filtro guardado abre sus opciones, donde el filtro puede eliminarse o compartirse.`)
};

/**
* | output |
* | --- |
* | "A combination of active filters can be saved as a named preset for reuse. Saved filters appear as quick access buttons above the filter pills. **Persistence...." |
*
* @param {Demo_Narrative_Topic_Saved_Filters_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_saved_filters_body = /** @type {((inputs?: Demo_Narrative_Topic_Saved_Filters_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Saved_Filters_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_saved_filters_body(inputs)
	return en_demo_narrative_topic_saved_filters_body(inputs)
});