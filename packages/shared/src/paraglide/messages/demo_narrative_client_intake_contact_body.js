/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Intake_Contact_BodyInputs */

const en_demo_narrative_client_intake_contact_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Contact_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The built-in form asks how the organization should reach the visitor and accepts a refusal, with a phone number, an email address and an option to send nothing as the three answers. [[#client-data #privacy]]
**What a contact detail becomes.** The answer is encrypted with the rest of the submission and nothing else is made of it. The client record a submission creates carries a generated alias and no phone row, no email row and no match hash, so a web submission is not compared against any other record until someone in the organization opens it and writes a contact value onto the case. [Duplicate client records](#dashboard/merge-candidates) covers the hashes that comparison needs and where they come from. [[#encryption #client-data]]
**Returning with an account.** A visitor can choose a username and password during submission, and the browser derives the keys for it before anything is sent. There is no password reset, and a forgotten password ends the thread rather than locking it, because nothing on the server can re-open what that password unlocked. [The client account](#client-account/sign-in) covers what the account opens afterward. [[#keys #failure-states]]
**Returning with a link.** The other option is a link that opens the same conversation with no account at all. The material that unlocks it rides in the fragment of the URL, which a browser does not send to a server, so possession of the link is the whole of the access check and a copy of it is as good as the original. Losing it ends the thread the same way a forgotten password does. [The channel lifecycle](#deep-dive/portal-channel-lifecycle) covers what the channel is. [[#keys #portal]]
**Why only one of the two.** Opening either option closes the other, and a submission carrying both is resolved in favor of the account. The two mint different channels for the same conversation, and one conversation with two ways in would widen the access set for no gain the visitor asked for. [[#permissions #portal]]
**The contact step and the two mint paths.** The contact answers are assembled in \`handleSubmit\` in \`packages/client/src/routes/(client)/intake/IntakeFormBody.svelte\` with labels pinned to the organization's base locale so queue-facing text reads the same whatever language the form was filled in. The account branch is \`buildAccountPayload\` and the link branch \`buildContinuationPayload\`, both in \`intake-crypto.ts\`, and the server writes them in \`handleAccountStep\` and \`handleContinuationStep\` in \`packages/server/src/portal/intake-service.ts\`. [[#portal #server-holds]]`)
};

const es_demo_narrative_client_intake_contact_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Contact_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El formulario integrado pregunta cómo debe contactar la organización con el visitante y acepta una negativa, con un número de teléfono, una dirección de correo y la opción de no dejar nada como las tres respuestas. [[#client-data #privacy]]
**En qué se convierte un dato de contacto.** La respuesta se cifra junto con el resto del envío y no se hace nada más con ella. El registro de cliente que crea un envío lleva un alias generado y ninguna fila de teléfono, ninguna fila de correo y ningún hash de coincidencia, así que un envío web no se compara con ningún otro registro hasta que alguien de la organización lo abre y escribe un dato de contacto en el caso. [Registros de cliente duplicados](#dashboard/merge-candidates) trata los hashes que necesita esa comparación y de dónde salen. [[#encryption #client-data]]
**Volver con una cuenta.** El visitante puede elegir un nombre de usuario y una contraseña durante el envío, y el navegador deriva sus claves antes de que se envíe nada. No hay restablecimiento de contraseña, y olvidarla termina la conversación en lugar de bloquearla, porque nada en el servidor puede reabrir lo que esa contraseña desbloqueaba. [La cuenta del cliente](#client-account/sign-in) trata lo que abre la cuenta después. [[#keys #failure-states]]
**Volver con un enlace.** La otra opción es un enlace que abre la misma conversación sin ninguna cuenta. El material que la desbloquea viaja en el fragmento de la URL, que el navegador no envía a ningún servidor, así que tener el enlace es toda la comprobación de acceso y una copia suya sirve igual que el original. Perderlo termina la conversación igual que una contraseña olvidada. [El ciclo de vida del canal](#deep-dive/portal-channel-lifecycle) trata qué es el canal. [[#keys #portal]]
**Por qué solo una de las dos.** Abrir cualquiera de las dos opciones cierra la otra, y un envío que lleve ambas se resuelve a favor de la cuenta. Las dos acuñan canales distintos para la misma conversación, y una conversación con dos vías de entrada ampliaría el conjunto de acceso sin que el visitante haya pedido nada a cambio. [[#permissions #portal]]
**El paso de contacto y las dos vías de acuñación.** Las respuestas de contacto se ensamblan en \`handleSubmit\`, en \`packages/client/src/routes/(client)/intake/IntakeFormBody.svelte\`, con las etiquetas fijadas al idioma base de la organización para que el texto que ve la cola se lea igual sea cual sea el idioma en que se rellenó el formulario. La rama de la cuenta es \`buildAccountPayload\` y la del enlace \`buildContinuationPayload\`, ambas en \`intake-crypto.ts\`, y el servidor las escribe en \`handleAccountStep\` y \`handleContinuationStep\`, en \`packages/server/src/portal/intake-service.ts\`. [[#portal #server-holds]]`)
};

const en_xa2_demo_narrative_client_intake_contact_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Contact_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè dèfàùlt fòrm's còntàct stèp àsks thè vìsìtòr hòw thè òrgànìzàtìòn shòùld rèàch thèm, wìth òptìòns fòr phònè, èmàìl, ànd à chòìcè tò sùbmìt wìthòùt lèàvìng còntàct ìnfòrmàtìòn.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••**Àccòùnt òpt-ìn. •••••** Thè ìntàkè fòrm òffèrs thè vìsìtòr thè òptìòn tò crèàtè àn àccòùnt dùrìng sùbmìssìòn by chòòsìng à ùsèrnàmè ànd pàsswòrd. Thèrè ìs nò wày tò rècòvèr à fòrgòttèn pàsswòrd, ànd ìf thè pàsswòrd ìs èvèr rèsèt thè vìsìtòr's mèssàgè hìstòry ìs pèrmànèntly lòst, sò thè chòìcè ìs ìrrèvèrsìblè ìn à wày à typìcàl àccòùnt ìs nòt. Thè òptìòn àppèàrs òn bòth thè dèfàùlt fòrm ànd òn cùstòm fòrms, ànd èxpàndìng ìt còllàpsès thè còntìnùàtìòn lìnk òptìòn.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Còntìnùàtìòn lìnk. ••••••** Thè ìntàkè fòrm àlsò òffèrs à còntìnùàtìòn lìnk thè vìsìtòr càn ùsè tò rètùrn ànd fòllòw ùp làtèr wìthòùt crèàtìng àn àccòùnt. Thè lìnk càrrìès thè kèy màtèrìàl thàt ùnlòcks thè cònvèrsàtìòn ìn ìts ÙRL fràgmènt, sò ànyònè whò hàs thè lìnk càn rèàd ànd rèply, ànd lòsìng ìt mèàns lòsìng àccèss wìth nò rècòvèry pàth. Èxpàndìng thìs òptìòn còllàpsès thè àccòùnt òptìòn. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The built-in form asks how the organization should reach the visitor and accepts a refusal, with a phone number, an email address and an option to send nothi..." |
*
* @param {Demo_Narrative_Client_Intake_Contact_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_contact_body = /** @type {((inputs?: Demo_Narrative_Client_Intake_Contact_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Intake_Contact_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_intake_contact_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_intake_contact_body(inputs)
	return en_demo_narrative_client_intake_contact_body(inputs)
});