/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Intake_Closed_BodyInputs */

const en_demo_narrative_client_intake_closed_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Closed_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A form can be given a closing date, after which it stops accepting submissions and shows a closing message in place of its questions. [[#portal #failure-states]]
**What the visitor is told.** The organization can write its own closing message, which is stored and protected the same way the form's other written content is, and a default notice stands in when it wrote none. The banner image stays, so a visitor who followed a shared link still lands somewhere recognizable rather than on a bare error. [The form builder](#admin-forms/builder) covers where the date and the message are set. [[#client-data]]
**What a late submission gets.** The date is compared against the server's clock at submission as well, so a page left open past the closing time is refused rather than accepted. The refusal is shaped identically to the answer for a form that does not exist, which keeps a submission attempt from confirming that some form was there a moment ago. [[#failure-states #metadata]]
**The closing column and the two checks.** The date is \`intake_forms.closes_at\` from \`packages/server/src/db/migrations/tenant/097_intake_form_closes_at.ts\`. The read path reports it through \`resolvePublicForm\` in \`packages/server/src/portal/intake-form-service.ts\` as a flag the page renders from, and the write path re-checks it in \`createIntakeTicket\` in \`packages/server/src/portal/intake-service.ts\`, which raises \`IntakeFormClosedError\` for the route to map onto the not-found shape. [[#server-holds #failure-states]]`)
};

const es_demo_narrative_client_intake_closed_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Closed_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A un formulario se le puede poner una fecha de cierre, a partir de la cual deja de aceptar envíos y muestra un mensaje de cierre en lugar de sus preguntas. [[#portal #failure-states]]
**Lo que se le dice al visitante.** La organización puede redactar su propio mensaje de cierre, que se guarda y se protege igual que el resto del contenido escrito del formulario, y un aviso predeterminado ocupa su lugar cuando no ha redactado ninguno. La imagen de portada se mantiene, de modo que quien haya seguido un enlace compartido llega a algo reconocible y no a un error escueto. [El constructor de formularios](#admin-forms/builder) trata dónde se fijan la fecha y el mensaje. [[#client-data]]
**Lo que recibe un envío tardío.** La fecha se compara también con el reloj del servidor en el momento del envío, así que una página dejada abierta pasada la hora de cierre se rechaza en lugar de aceptarse. El rechazo tiene la misma forma que la respuesta a un formulario que no existe, lo que impide que un intento de envío confirme que había un formulario hace un momento. [[#failure-states #metadata]]
**La columna de cierre y las dos comprobaciones.** La fecha es \`intake_forms.closes_at\`, de \`packages/server/src/db/migrations/tenant/097_intake_form_closes_at.ts\`. La vía de lectura la informa mediante \`resolvePublicForm\`, en \`packages/server/src/portal/intake-form-service.ts\`, como una marca a partir de la cual se muestra la página, y la vía de escritura la vuelve a comprobar en \`createIntakeTicket\`, en \`packages/server/src/portal/intake-service.ts\`, que lanza \`IntakeFormClosedError\` para que la ruta lo transforme en la forma de no encontrado. [[#server-holds #failure-states]]`)
};

const en_xa2_demo_narrative_client_intake_closed_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Closed_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè clòsèd fòrm stàtè rèplàcès thè fòrm fìèlds wìth thè òrgànìzàtìòn's cònfìgùrèd clòsìng mèssàgè ànd prèvènts sùbmìssìòn.
 •••••••••••••••••••••••••••••••••••••**Cùstòm mèssàgè. •••••** Àdmìnìstràtòrs càn wrìtè à clòsìng mèssàgè ìn thè fòrm bùìldèr's còntènt sèctìòn, ànd ìf nò cùstòm mèssàgè ìs sèt à dèfàùlt nòtìcè tèlls thè vìsìtòr thàt thè fòrm ìs nò lòngèr àccèptìng sùbmìssìòns. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A form can be given a closing date, after which it stops accepting submissions and shows a closing message in place of its questions. [[#portal #failure-stat..." |
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