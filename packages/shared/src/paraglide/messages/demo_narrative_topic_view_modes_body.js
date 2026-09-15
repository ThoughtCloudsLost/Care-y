/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_View_Modes_BodyInputs */

const en_demo_narrative_topic_view_modes_body = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The ticket list supports five layout options.
- **Table** presents tickets in a sortable data table with columns for each field
- **Rows** show compact single line entries with status indicators
- **Cards** show each ticket with a message preview bubble for more context
- **Grid** arranges tickets in a grid of smaller compact cards
- **Kanban** (coming soon) will group tickets into swimlanes by status
**Persistence.** The selected mode is saved locally and persists between sessions. The overview page has its own view mode preference stored separately, and it does not include the Kanban option.`)
};

const es_demo_narrative_topic_view_modes_body = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La lista de tickets soporta cinco opciones de disposición.
- **Tabla** presenta los tickets en una tabla de datos ordenable con columnas para cada campo
- **Filas** muestran entradas compactas de una línea con indicadores de estado
- **Tarjetas** muestran cada ticket con una burbuja de vista previa del mensaje para más contexto
- **Cuadrícula** organiza los tickets en una cuadrícula de tarjetas compactas más pequeñas
- **Kanban** (próximamente) agrupará los tickets en carriles por estado
**Persistencia.** El modo seleccionado se guarda localmente y persiste entre sesiones. La página de resumen tiene su propia preferencia de modo de vista almacenada por separado, y no incluye la opción Kanban.`)
};

/**
* | output |
* | --- |
* | "The ticket list supports five layout options. - **Table** presents tickets in a sortable data table with columns for each field - **Rows** show compact singl..." |
*
* @param {Demo_Narrative_Topic_View_Modes_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_view_modes_body = /** @type {((inputs?: Demo_Narrative_Topic_View_Modes_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_View_Modes_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_view_modes_body(inputs)
	return en_demo_narrative_topic_view_modes_body(inputs)
});