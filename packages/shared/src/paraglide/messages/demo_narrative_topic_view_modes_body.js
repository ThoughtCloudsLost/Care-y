/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_View_Modes_BodyInputs */

const en_demo_narrative_topic_view_modes_body = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The ticket list supports four layout options with a fifth planned.
- **Rows** show compact single line entries with status indicators
- **Cards** show each ticket with a message preview bubble for more context
- **Grid** arranges tickets in a grid of smaller cards
- **Table** presents tickets in a sortable data table with columns for each field
- **Kanban** (coming soon) will group tickets into swimlanes by status
**Persistence.** The selected mode is saved locally and persists between sessions. The same view mode options are available on the dashboard ticket sections.`)
};

const es_demo_narrative_topic_view_modes_body = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La lista de tickets soporta cuatro opciones de disposicion con una quinta planificada.
- **Filas** muestran entradas compactas de una linea con indicadores de estado
- **Tarjetas** muestran cada ticket con una burbuja de vista previa del mensaje para mas contexto
- **Cuadricula** organiza los tickets en una cuadricula de tarjetas mas pequenas
- **Tabla** presenta los tickets en una tabla de datos ordenable con columnas para cada campo
- **Kanban** (proximamente) agrupara los tickets en carriles por estado
**Persistencia.** El modo seleccionado se guarda localmente y persiste entre sesiones. Las mismas opciones de modo de vista estan disponibles en las secciones de tickets del panel principal.`)
};

/**
* | output |
* | --- |
* | "The ticket list supports four layout options with a fifth planned. - **Rows** show compact single line entries with status indicators - **Cards** show each t..." |
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