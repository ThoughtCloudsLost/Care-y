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

const en_xa2_demo_narrative_topic_view_modes_body = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè tìckèt lìst sùppòrts fìvè làyòùt òptìòns.
-  •••••••••••••••**Tàblè ••** prèsènts tìckèts ìn à sòrtàblè dàtà tàblè wìth còlùmns fòr èàch fìèld
-  ••••••••••••••••••••••**Ròws ••** shòw còmpàct sìnglè lìnè èntrìès wìth stàtùs ìndìcàtòrs
-  ••••••••••••••••••**Càrds ••** shòw èàch tìckèt wìth à mèssàgè prèvìèw bùbblè fòr mòrè còntèxt
-  •••••••••••••••••••••**Grìd ••** àrràngès tìckèts ìn à grìd òf smàllèr còmpàct càrds
-  •••••••••••••••••**Kànbàn ••** (còmìng sòòn) wìll gròùp tìckèts ìntò swìmlànès by stàtùs
 ••••••••••••••••••**Pèrsìstèncè. ••••** Thè sèlèctèd mòdè ìs sàvèd lòcàlly ànd pèrsìsts bètwèèn sèssìòns. Thè òvèrvìèw pàgè hàs ìts òwn vìèw mòdè prèfèrèncè stòrèd sèpàràtèly, ànd ìt dòès nòt ìnclùdè thè Kànbàn òptìòn. ••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The ticket list supports five layout options. - **Table** presents tickets in a sortable data table with columns for each field - **Rows** show compact singl..." |
*
* @param {Demo_Narrative_Topic_View_Modes_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_view_modes_body = /** @type {((inputs?: Demo_Narrative_Topic_View_Modes_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_View_Modes_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_view_modes_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_view_modes_body(inputs)
	return en_demo_narrative_topic_view_modes_body(inputs)
});