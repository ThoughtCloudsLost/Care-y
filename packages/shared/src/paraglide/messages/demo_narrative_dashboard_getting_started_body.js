/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Getting_Started_BodyInputs */

const en_demo_narrative_dashboard_getting_started_body = /** @type {(inputs: Demo_Narrative_Dashboard_Getting_Started_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A setup checklist on the dashboard guides initial configuration. Each item links to the admin page where it is completed. Only accounts with the Manage org identity permission can see the checklist. [[#permissions]]
**Completion checks.** [[#server-holds]]
- Invite team members completes when more than one account is active.
- Customize branding completes when a logo is set.
- Set up phone greetings completes when a greeting exists.
- Configure SMS templates completes when a text response exists.
- Add preset replies completes when a preset reply exists.
- Add knowledge base articles completes when an article exists.
- Set up additional queues completes when more than one queue exists.
- Configure data retention completes when a retention period is set.
Every check is a row count or a null test. The server never reads the content of a greeting, an article, or a queue name to evaluate completion. [[#server-holds]]
**What does the server already hold?** The counts and null tests use totals the server stores regardless of the checklist. A database dump shows how many active accounts, queues, and articles exist and whether a logo and retention period are set, without any of the names or content behind them. [Retention policy](#admin-org/retention) covers what the retention setting does. [[#metadata #server-holds]]
**Dismissal.** Dismissing sets one timestamp on the organization's config row. The checklist disappears for every account that could see it. No route restores it. The dismissal records nothing about any individual account. [[#failure-states #server-holds]]
**The checklist service and its routes.** \`createDashboardService\` in \`packages/server/src/dashboard/dashboard-service.ts\` runs the counts behind routes gated on \`Permission.MANAGE_ORG_IDENTITY\`. The item definitions and their labels are in \`packages/client/src/lib/onboarding/checklist-items.ts\`. The dismissal column is \`getting_started_dismissed_at\` on \`org_config\`, from migration \`071_add_getting_started_dismissed.ts\`. [[#permissions]]`)
};

const es_demo_narrative_dashboard_getting_started_body = /** @type {(inputs: Demo_Narrative_Dashboard_Getting_Started_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una lista de primeros pasos en el panel principal guía la configuración inicial. Cada elemento enlaza a la página de administración donde se completa. Solo las cuentas con el permiso Gestionar identidad de la organización pueden ver la lista. [[#permissions]]
**Comprobaciones de estado.** [[#server-holds]]
- Invitar miembros del equipo se completa cuando hay más de una cuenta activa.
- Personalizar la marca se completa cuando hay un logotipo configurado.
- Configurar saludos telefónicos se completa cuando existe un saludo.
- Configurar plantillas SMS se completa cuando existe una respuesta de texto.
- Agregar respuestas predefinidas se completa cuando existe una respuesta predefinida.
- Agregar artículos a la base de conocimiento se completa cuando existe un artículo.
- Configurar colas adicionales se completa cuando existe más de una cola.
- Configurar retención de datos se completa cuando hay un periodo de retención configurado.
Cada comprobación es un recuento de filas o una prueba de nulidad. El servidor nunca lee el contenido de un saludo, un artículo ni el nombre de una cola para evaluar si está completo. [[#server-holds]]
**¿Qué tiene ya el servidor?** Los recuentos y las pruebas de nulidad usan totales que el servidor almacena con independencia de la lista. Un volcado de la base de datos muestra cuántas cuentas activas, colas y artículos existen, y si hay un logotipo y un periodo de retención configurados, sin ninguno de los nombres ni del contenido que hay detrás. [Política de retención](#admin-org/retention) trata lo que hace el ajuste de retención. [[#metadata #server-holds]]
**Descarte.** Descartar fija una sola marca de tiempo en la fila de configuración de la organización. La lista desaparece para todas las cuentas que podían verla. Ninguna ruta la restaura. El descarte no registra nada sobre ninguna cuenta concreta. [[#failure-states #server-holds]]
**El servicio de la lista y sus rutas.** \`createDashboardService\`, en \`packages/server/src/dashboard/dashboard-service.ts\`, ejecuta los recuentos detrás de rutas protegidas por \`Permission.MANAGE_ORG_IDENTITY\`. Las definiciones de los elementos y sus etiquetas están en \`packages/client/src/lib/onboarding/checklist-items.ts\`. La columna de descarte es \`getting_started_dismissed_at\` en \`org_config\`, de la migración \`071_add_getting_started_dismissed.ts\`. [[#permissions]]`)
};

const en_xa2_demo_narrative_dashboard_getting_started_body = /** @type {(inputs: Demo_Narrative_Dashboard_Getting_Started_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À sètùp chècklìst òn thè dàshbòàrd gùìdès ìnìtìàl cònfìgùràtìòn. Èàch ìtèm lìnks tò thè àdmìn pàgè whèrè ìt ìs còmplètèd. Ònly àccòùnts wìth thè Mànàgè òrg ìdèntìty pèrmìssìòn càn sèè thè chècklìst. [[#pèrmìssìòns]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Còmplètìòn chècks. ••••••** [[#sèrvèr-hòlds]]
- Ìnvìtè tèàm mèmbèrs còmplètès whèn mòrè thàn ònè àccòùnt ìs àctìvè.
- Cùstòmìzè bràndìng còmplètès whèn à lògò ìs sèt.
- Sèt ùp phònè grèètìngs còmplètès whèn à grèètìng èxìsts.
- Cònfìgùrè SMS tèmplàtès còmplètès whèn à tèxt rèspònsè èxìsts.
- Àdd prèsèt rèplìès còmplètès whèn à prèsèt rèply èxìsts.
- Àdd knòwlèdgè bàsè àrtìclès còmplètès whèn àn àrtìclè èxìsts.
- Sèt ùp àddìtìònàl qùèùès còmplètès whèn mòrè thàn ònè qùèùè èxìsts.
- Cònfìgùrè dàtà rètèntìòn còmplètès whèn à rètèntìòn pèrìòd ìs sèt.
Èvèry chèck ìs à ròw còùnt òr à nùll tèst. Thè sèrvèr nèvèr rèàds thè còntènt òf à grèètìng, àn àrtìclè, òr à qùèùè nàmè tò èvàlùàtè còmplètìòn. [[#sèrvèr-hòlds]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè sèrvèr àlrèàdy hòld? •••••••••••** Thè còùnts ànd nùll tèsts ùsè tòtàls thè sèrvèr stòrès règàrdlèss òf thè chècklìst. À dàtàbàsè dùmp shòws hòw màny àctìvè àccòùnts, qùèùès, ànd àrtìclès èxìst ànd whèthèr à lògò ànd rètèntìòn pèrìòd àrè sèt, wìthòùt àny òf thè nàmès òr còntènt bèhìnd thèm. [Rètèntìòn pòlìcy](#àdmìn-òrg/rètèntìòn) còvèrs whàt thè rètèntìòn sèttìng dòès. [[#mètàdàtà #sèrvèr-hòlds]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Dìsmìssàl. •••** Dìsmìssìng sèts ònè tìmèstàmp òn thè òrgànìzàtìòn's cònfìg ròw. Thè chècklìst dìsàppèàrs fòr èvèry àccòùnt thàt còùld sèè ìt. Nò ròùtè rèstòrès ìt. Thè dìsmìssàl rècòrds nòthìng àbòùt àny ìndìvìdùàl àccòùnt. [[#fàìlùrè-stàtès #sèrvèr-hòlds]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè chècklìst sèrvìcè ànd ìts ròùtès. ••••••••••••** \`crèàtèDàshbòàrdSèrvìcè\` ìn \`pàckàgès/sèrvèr/src/dàshbòàrd/dàshbòàrd-sèrvìcè.ts\` rùns thè còùnts bèhìnd ròùtès gàtèd òn \`Pèrmìssìòn.MÀNÀGÈ_ÒRG_ÌDÈNTÌTY\`. Thè ìtèm dèfìnìtìòns ànd thèìr làbèls àrè ìn \`pàckàgès/clìènt/src/lìb/ònbòàrdìng/chècklìst-ìtèms.ts\`. Thè dìsmìssàl còlùmn ìs \`gèttìng_stàrtèd_dìsmìssèd_àt\` òn \`òrg_cònfìg\`, fròm mìgràtìòn \`071_àdd_gèttìng_stàrtèd_dìsmìssèd.ts\`. [[#pèrmìssìòns]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A setup checklist on the dashboard guides initial configuration. Each item links to the admin page where it is completed. Only accounts with the Manage org i..." |
*
* @param {Demo_Narrative_Dashboard_Getting_Started_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_getting_started_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Getting_Started_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Getting_Started_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_getting_started_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_getting_started_body(inputs)
	return en_demo_narrative_dashboard_getting_started_body(inputs)
});