/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_View_Switcher_BodyInputs */

const en_demo_narrative_dashboard_view_switcher_body = /** @type {(inputs: Demo_Narrative_Dashboard_View_Switcher_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The view switcher in the page header changes how ticket lists on the dashboard are displayed.
**Available modes:**
- **Table** presents tickets in a sortable data table
- **Rows** show compact single line entries with status indicators, ideal for scanning a long list quickly
- **Cards** show each ticket as a card with a message preview bubble, giving more context at a glance
- **Grid** arranges tickets in a grid of smaller cards for a denser overview
**Persistence.** The selected mode is saved locally on the device. It applies to all ticket sections on the dashboard and persists between sessions.`)
};

const es_demo_narrative_dashboard_view_switcher_body = /** @type {(inputs: Demo_Narrative_Dashboard_View_Switcher_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El selector de vista en el encabezado de la página cambia cómo se muestran las listas de tickets en el panel principal.
**Modos disponibles:**
- **Tabla** presenta los tickets en una tabla de datos ordenable
- **Filas** muestran entradas compactas de una línea con indicadores de estado, ideales para recorrer una lista larga rápidamente
- **Tarjetas** muestran cada ticket como una tarjeta con una burbuja de vista previa del mensaje, dando más contexto de un vistazo
- **Cuadrícula** organiza los tickets en una cuadrícula de tarjetas más pequeñas para una visión general más densa
**Persistencia.** El modo seleccionado se guarda localmente en el dispositivo. Se aplica a todas las secciones de tickets del panel principal y persiste entre sesiones.`)
};

/**
* | output |
* | --- |
* | "The view switcher in the page header changes how ticket lists on the dashboard are displayed. **Available modes:** - **Table** presents tickets in a sortable..." |
*
* @param {Demo_Narrative_Dashboard_View_Switcher_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_view_switcher_body = /** @type {((inputs?: Demo_Narrative_Dashboard_View_Switcher_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_View_Switcher_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_dashboard_view_switcher_body(inputs)
	return es_demo_narrative_dashboard_view_switcher_body(inputs)
});