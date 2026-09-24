/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Form_Settings_BodyInputs */

const en_demo_narrative_admin_form_settings_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Form settings hold the name the organization files a form under, the address it answers on, the queue its cases land in, the date it stops accepting answers and the banner image at its head. [[#portal]]
**What the server holds of them.** The name and the address are plaintext columns, because they carry no answer and no question, and the server has to match an incoming request against the address. The banner is encrypted at rest under the key derived from the organization's public key, and the route that serves it is unauthenticated and decrypts it on request, so it is as public as the page it sits on. [The trust boundary](#deep-dive/the-trust-boundary) covers what a dump gives up. [[#server-holds #encryption]]
**The address and the default.** A form's address is its own, and an address already taken by another form is refused when the form is saved. One form at a time can be the default, which is the one served when a link names no form, and marking a new default clears the old one in the same write. [The intake forms list](#admin-org/intake-forms) covers what happens when nothing is default and what activating a form does that saving does not. [[#portal #failure-states]]
**The closing date.** A form with a closing date stops accepting answers once the date passes and answers with the closed message instead, falling back to a built-in text when the organization has not written one. A form left with no closing date stays open until someone deactivates it. [Closed forms](#client-intake/closed-form) covers what the visitor reaches. [[#portal]]
**The link the form is shared as.** The public link is built from the address as it is typed, so it can be copied before the form has ever been saved, and it leads somewhere only once the form has been saved with that address and activated. It needs no account to open, which is the point of it. [[#failure-states #portal]]
**The settings columns and the asset route.** Name, slug, default flag, destination queue and closing date are columns on \`intake_forms\` from \`packages/server/src/db/migrations/tenant/089_intake_forms.ts\` and \`097_intake_form_closes_at.ts\`, while the banner is a row in \`form_assets\` from \`099_form_assets.ts\` pointing at a blob. \`packages/server/src/routes/form-assets.ts\` serves that blob to anyone under \`/api/forms/\`, restricted to the form-asset prefix and three image content types. [[#server-holds]]`)
};

const es_demo_narrative_admin_form_settings_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La configuración del formulario contiene el nombre con el que la organización lo archiva, la dirección en la que responde, la cola en la que aterrizan sus casos, la fecha en la que deja de aceptar respuestas y la imagen de cabecera. [[#portal]]
**Qué guarda el servidor de todo eso.** El nombre y la dirección son columnas en texto plano, porque no llevan ninguna respuesta ni ninguna pregunta, y el servidor tiene que comparar una petición entrante con la dirección. La imagen de cabecera se cifra en reposo con la clave derivada de la clave pública de la organización, y la ruta que la sirve no requiere autenticación y la descifra al pedirla, así que es tan pública como la página en la que aparece. [La frontera de confianza](#deep-dive/the-trust-boundary) trata lo que entrega un volcado. [[#server-holds #encryption]]
**La dirección y el formulario predeterminado.** La dirección de un formulario es suya, y una dirección que ya ocupa otro formulario se rechaza al guardar. Un solo formulario a la vez puede ser el predeterminado, que es el que se sirve cuando un enlace no nombra ninguno, y marcar uno nuevo como predeterminado deja de serlo el anterior en la misma escritura. [La lista de formularios de admisión](#admin-org/intake-forms) trata qué ocurre cuando no hay ninguno predeterminado y qué hace la activación que no hace el guardado. [[#portal #failure-states]]
**La fecha de cierre.** Un formulario con fecha de cierre deja de aceptar respuestas cuando la fecha pasa y responde con el mensaje de cierre, que recurre a un texto integrado cuando la organización no ha escrito el suyo. Un formulario sin fecha de cierre sigue abierto hasta que alguien lo desactiva. [Formularios cerrados](#client-intake/closed-form) trata a qué llega el visitante. [[#portal]]
**El enlace con el que se comparte el formulario.** El enlace público se construye con la dirección tal como se escribe, así que se puede copiar antes de que el formulario se haya guardado nunca, y lleva a alguna parte solo cuando el formulario se ha guardado con esa dirección y se ha activado. Abrirlo no requiere cuenta, que es justamente para lo que es. [[#failure-states #portal]]
**Las columnas de configuración y la ruta de recursos.** El nombre, el identificador, la marca de predeterminado, la cola de destino y la fecha de cierre son columnas de \`intake_forms\`, de \`packages/server/src/db/migrations/tenant/089_intake_forms.ts\` y \`097_intake_form_closes_at.ts\`, mientras que la imagen de cabecera es una fila de \`form_assets\`, de \`099_form_assets.ts\`, que apunta a un blob. \`packages/server/src/routes/form-assets.ts\` sirve ese blob a cualquiera bajo \`/api/forms/\`, restringido al prefijo de recursos de formulario y a tres tipos de imagen. [[#server-holds]]`)
};

const en_xa2_demo_narrative_admin_form_settings_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè sèttìngs blòck còntròls thè fòrm's ìdèntìty ànd bèhàvìòr.
 •••••••••••••••••••**Whàt thè sèrvèr hòlds. •••••••** Thè fòrm nàmè ànd pùblìc slùg àrè stòrèd às plàìntèxt òn thè sèrvèr bècàùsè thèy càrry nò sènsìtìvè còntènt, whìlè thè bànnèr ìmàgè ìs èncryptèd ùndèr à kèy dèrìvèd fròm thè òrgànìzàtìòn's pùblìc kèy bèfòrè ùplòàd.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw ìt wòrks. ••••** Ònly ònè fòrm càn hòld thè dèfàùlt àt à tìmè, ànd thè dèfàùlt ìs whàt wèb ìntàkè sèrvès àt thè bàsè ÙRL whèn nò slùg ìs spècìfìèd. Thè dèstìnàtìòn qùèùè dètèrmìnès whìch qùèùè rècèìvès tìckèts crèàtèd thròùgh thìs fòrm.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Clòsìng dàtè. ••••** Whèn thè clòsìng dàtè pàssès, thè vìsìtòr sèès thè clòsèd mèssàgè, whìch fàlls bàck tò à dèfàùlt ìf thè òrgànìzàtìòn hàs nòt wrìttèn ònè. Lèàvìng thè dàtè blànk mèàns thè fòrm stàys òpèn ìndèfìnìtèly.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Shàrè lìnk. ••••** Thè pùblìc ÙRL ìs pròdùcèd fròm thè fòrm's slùg ànd rèqùìrès nò àccòùnt tò rèàch, ànd ìt dòès nòt èxìst ùntìl thè fòrm hàs bèèn sàvèd. •••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Form settings hold the name the organization files a form under, the address it answers on, the queue its cases land in, the date it stops accepting answers ..." |
*
* @param {Demo_Narrative_Admin_Form_Settings_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_settings_body = /** @type {((inputs?: Demo_Narrative_Admin_Form_Settings_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Form_Settings_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_form_settings_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_form_settings_body(inputs)
	return en_demo_narrative_admin_form_settings_body(inputs)
});