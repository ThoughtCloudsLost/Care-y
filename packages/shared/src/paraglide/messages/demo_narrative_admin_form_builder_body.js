/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Form_Builder_BodyInputs */

const en_demo_narrative_admin_form_builder_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Builder_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A form is edited as one working copy in the browser and written as one whole, so adding, removing, reordering and reconfiguring fields all accumulate until a save replaces the form's entire field list on the server. [[#client-data]]
**What a field can be.** Nine types are available. Seven collect an answer, meaning a short text field, a long text field, a single pick, a multiple pick, a checkbox, a date and an availability grid, and two shape the page instead, a page break and a rich text block. A form holds at most one availability grid, and it holds between one and a hundred fields, both enforced in the browser and again on the server. [Field settings](#admin-forms/field-config) covers what each type offers. [[#client-data]]
**What the editor does on its own.** Removing a field takes effect in the working copy with no confirmation and reaches the server only on the next save. Leaving a brand new field's settings without finishing them drops the field rather than keeping an unconfigured one in the list. Removing or reordering a field sweeps any visibility rule that pointed at it, because a rule may only reference a field that still exists and still comes earlier, so a rule cannot survive against a field that has moved behind the one it governs. [[#failure-states]]
**What a save writes and what stays readable.** Each field's label, its configuration and its visibility rule are encrypted in the browser before the request leaves, under the same key the public page derives from the organization's public key. The field's own key, its type, its semantic role, the queues an option routes to and whether it is required travel in the clear, because the destination of a case and its urgency are resolved from them when someone submits. The list of people a field escalates to is encrypted under the server's operational key. A dump therefore shows the shape of a form, meaning how many fields, of which types, in which order, carrying which roles, and none of the wording of any of them. [The trust boundary](#deep-dive/the-trust-boundary) covers what that shape gives away. [[#encryption #server-holds #metadata]]
**Who can edit one.** Editing a form requires the Manage intake forms permission, which does not carry the permission to read what anyone submitted. [The intake forms list](#admin-org/intake-forms) covers the two grants and the publishing step a save deliberately skips. [[#permissions]]
**The whole-form save path.** The editor is \`packages/client/src/lib/components/admin/IntakeFormEditor.svelte\`, and the encryption in front of the request is \`encryptFieldContent\` and \`encryptFormMeta\` in \`packages/crypto/src/intake-form.ts\`. On the server, \`saveForm\` in \`packages/server/src/portal/intake-form-service.ts\` runs in one transaction that deletes the existing field rows and reinserts the submitted list at positions zero upward, so field order is the array order and a field's identity across saves is the key minted when it was added. [[#client-data #encryption]]`)
};

const es_demo_narrative_admin_form_builder_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Builder_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un formulario se edita como una única copia de trabajo en el navegador y se escribe entero de una vez, así que añadir, quitar, reordenar y reconfigurar campos se va acumulando hasta que un guardado sustituye toda la lista de campos del formulario en el servidor. [[#client-data]]
**Qué puede ser un campo.** Hay nueve tipos disponibles. Siete recogen una respuesta, es decir un campo de texto corto, uno de texto largo, una selección simple, una selección múltiple, una casilla, una fecha y una rejilla de disponibilidad, y dos dan forma a la página en su lugar, un salto de página y un bloque de texto enriquecido. Un formulario admite como mucho una rejilla de disponibilidad, y admite entre uno y cien campos, ambas cosas comprobadas en el navegador y otra vez en el servidor. [Configuración de campo](#admin-forms/field-config) trata lo que ofrece cada tipo. [[#client-data]]
**Qué hace el editor por su cuenta.** Quitar un campo surte efecto en la copia de trabajo sin confirmación y llega al servidor solo en el siguiente guardado. Salir de la configuración de un campo recién creado sin terminarla descarta el campo en vez de dejar uno sin configurar en la lista. Quitar o reordenar un campo barre cualquier regla de visibilidad que apuntara a él, porque una regla solo puede referirse a un campo que siga existiendo y siga estando antes, así que una regla no sobrevive contra un campo que ha pasado a ir detrás del campo que gobierna. [[#failure-states]]
**Qué escribe un guardado y qué queda legible.** La etiqueta de cada campo, su configuración y su regla de visibilidad se cifran en el navegador antes de que salga la petición, con la misma clave que la página pública deriva de la clave pública de la organización. La clave propia del campo, su tipo, su rol semántico, las colas a las que encamina una opción y si es obligatorio viajan en claro, porque el destino de un caso y su urgencia se resuelven a partir de ellos cuando alguien envía el formulario. La lista de personas a las que escala un campo se cifra con la clave operativa del servidor. Un volcado muestra entonces la forma de un formulario, es decir cuántos campos, de qué tipos, en qué orden y con qué roles, y ninguna palabra de ninguno de ellos. [La frontera de confianza](#deep-dive/the-trust-boundary) trata lo que esa forma deja ver. [[#encryption #server-holds #metadata]]
**Quién puede editarlo.** Editar un formulario requiere el permiso de gestionar formularios de admisión, que no trae consigo el permiso de leer lo que alguien envió. [La lista de formularios de admisión](#admin-org/intake-forms) trata las dos concesiones y el paso de publicación que un guardado deja a propósito sin hacer. [[#permissions]]
**La vía de guardado del formulario completo.** El editor es \`packages/client/src/lib/components/admin/IntakeFormEditor.svelte\`, y el cifrado previo a la petición son \`encryptFieldContent\` y \`encryptFormMeta\`, en \`packages/crypto/src/intake-form.ts\`. En el servidor, \`saveForm\`, en \`packages/server/src/portal/intake-form-service.ts\`, corre en una única transacción que borra las filas de campos existentes y reinserta la lista enviada desde la posición cero, de modo que el orden de los campos es el del arreglo y la identidad de un campo entre guardados es la clave acuñada cuando se añadió. [[#client-data #encryption]]`)
};

const en_xa2_demo_narrative_admin_form_builder_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Builder_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè fòrm èdìtòr sàvès às à whòlè, sò chàngès tò fìèlds àccùmùlàtè ùntìl thè ùsèr sàvès thè fòrm.
 ••••••••••••••••••••••••••••••**Rèmòvìng. •••** Rèmòvìng à fìèld ìs ìmmèdìàtè ànd hàs nò cònfìrmàtìòn, bùt thè rèmòvàl ìs nòt pèrsìstèd ùntìl thè fòrm ìs sàvèd.
 •••••••••••••••••••••••••••••••••••**Fìèld typès. ••••** Nìnè typès àrè àvàìlàblè, splìt bètwèèn sèvèn thàt còllèct ànswèrs ànd twò strùctùràl èlèmènts thàt dò nòt. Thè strùctùràl pàìr, pàgè brèàk ànd rìch tèxt, còntròls làyòùt ònly, ànd à rìch tèxt ròw shòws à prèvìèw òf ìts bòdy ìn plàcè òf à làbèl.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Fìèld làbèls, cònfìgùràtìòn, ànd fòrm mètàdàtà àrè èncryptèd ùndèr à kèy dèrìvèd fròm thè òrgànìzàtìòn's pùblìc kèy, sò thè ìntàkè pàgè càn rèàd thè fòrm wìthòùt àn àccòùnt whìlè à dàtàbàsè dùmp stàys òpàqùè. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A form is edited as one working copy in the browser and written as one whole, so adding, removing, reordering and reconfiguring fields all accumulate until a..." |
*
* @param {Demo_Narrative_Admin_Form_Builder_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_builder_body = /** @type {((inputs?: Demo_Narrative_Admin_Form_Builder_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Form_Builder_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_form_builder_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_form_builder_body(inputs)
	return en_demo_narrative_admin_form_builder_body(inputs)
});