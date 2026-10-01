/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Intake_Closed_BodyInputs */

const en_demo_narrative_client_intake_closed_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Closed_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A form whose closing date has passed replaces its fields with the organization's closing message. When no closing message has been written, a built-in notice takes its place. The banner image remains, so a visitor arriving from a shared link reaches a recognizable page. [Form settings](#admin-forms/form-settings) covers where the date and the message are set. [[#portal #failure-states]]
**What does a late submission get?** The server compares the closing date against its own clock at submission time. A page left open past the closing date is refused on submit. The visitor's typed answers stay in the browser and are not lost. [[#failure-states #metadata]]
**The date column and its two checks.** \`intake_forms.closes_at\` stores the closing date, defined in \`packages/server/src/db/migrations/tenant/001_baseline.ts\`. \`resolvePublicForm\` in \`packages/server/src/portal/intake-form-service.ts\` reports it as a flag the page reads. \`createIntakeTicket\` in \`packages/server/src/portal/intake-service.ts\` re-checks it and raises \`IntakeFormClosedError\`, which the route maps to the same shape as a disabled or missing form. [[#server-holds #failure-states]]`)
};

const es_demo_narrative_client_intake_closed_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Closed_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un formulario cuya fecha de cierre ya pasó reemplaza sus campos con el mensaje de cierre de la organización. Cuando no se ha escrito un mensaje de cierre, un aviso predeterminado ocupa su lugar. La portada del formulario sigue visible, así que un visitante que llegue desde un enlace compartido encuentra una página reconocible. [Configuración del formulario](#admin-forms/form-settings) trata dónde se configuran la fecha y el mensaje. [[#portal #failure-states]]
**¿Qué recibe un envío tardío?** El servidor compara la fecha de cierre contra su propio reloj en el momento del envío. Una página que permanezca abierta después de la fecha de cierre es rechazada al enviarse. Las respuestas que el visitante escribió permanecen en el navegador y no se pierden. [[#failure-states #metadata]]
**La columna de fecha y sus dos verificaciones.** \`intake_forms.closes_at\` almacena la fecha de cierre, definida en \`packages/server/src/db/migrations/tenant/001_baseline.ts\`. \`resolvePublicForm\` en \`packages/server/src/portal/intake-form-service.ts\` la reporta como un indicador que la página lee. \`createIntakeTicket\` en \`packages/server/src/portal/intake-service.ts\` la verifica de nuevo y lanza \`IntakeFormClosedError\`, que la ruta asigna a la misma forma que un formulario desactivado o inexistente. [[#server-holds #failure-states]]`)
};

const en_xa2_demo_narrative_client_intake_closed_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Closed_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À fòrm whòsè clòsìng dàtè hàs pàssèd rèplàcès ìts fìèlds wìth thè òrgànìzàtìòn's clòsìng mèssàgè. Whèn nò clòsìng mèssàgè hàs bèèn wrìttèn, à bùìlt-ìn nòtìcè tàkès ìts plàcè. Thè bànnèr ìmàgè rèmàìns, sò à vìsìtòr àrrìvìng fròm à shàrèd lìnk rèàchès à rècògnìzàblè pàgè. [Fòrm sèttìngs](#àdmìn-fòrms/fòrm-sèttìngs) còvèrs whèrè thè dàtè ànd thè mèssàgè àrè sèt. [[#pòrtàl #fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès à làtè sùbmìssìòn gèt? ••••••••••** Thè sèrvèr còmpàrès thè clòsìng dàtè àgàìnst ìts òwn clòck àt sùbmìssìòn tìmè. À pàgè lèft òpèn pàst thè clòsìng dàtè ìs rèfùsèd òn sùbmìt. Thè vìsìtòr's typèd ànswèrs stày ìn thè bròwsèr ànd àrè nòt lòst. [[#fàìlùrè-stàtès #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè dàtè còlùmn ànd ìts twò chècks. •••••••••••** \`ìntàkè_fòrms.clòsès_àt\` stòrès thè clòsìng dàtè, dèfìnèd ìn \`pàckàgès/sèrvèr/src/db/mìgràtìòns/tènànt/001_bàsèlìnè.ts\`. \`rèsòlvèPùblìcFòrm\` ìn \`pàckàgès/sèrvèr/src/pòrtàl/ìntàkè-fòrm-sèrvìcè.ts\` rèpòrts ìt às à flàg thè pàgè rèàds. \`crèàtèÌntàkèTìckèt\` ìn \`pàckàgès/sèrvèr/src/pòrtàl/ìntàkè-sèrvìcè.ts\` rè-chècks ìt ànd ràìsès \`ÌntàkèFòrmClòsèdÈrròr\`, whìch thè ròùtè màps tò thè sàmè shàpè às à dìsàblèd òr mìssìng fòrm. [[#sèrvèr-hòlds #fàìlùrè-stàtès]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A form whose closing date has passed replaces its fields with the organization's closing message. When no closing message has been written, a built-in notice..." |
*
* @param {Demo_Narrative_Client_Intake_Closed_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_closed_body = /** @type {((inputs?: Demo_Narrative_Client_Intake_Closed_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Intake_Closed_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_intake_closed_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_intake_closed_body(inputs)
	return en_demo_narrative_client_intake_closed_body(inputs)
});